import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../_auth';
import * as $OpenApi from '@alicloud/openapi-client';
import Alidns20150109, * as $Alidns20150109 from '@alicloud/alidns20150109';
import { PROJECTS_CONFIG } from '@/lib/config';

export async function POST(request: Request) {
    // 1. 验证管理员 Token
    const authHeader = request.headers.get('authorization') || undefined;
    if (!verifyAdminToken(authHeader)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { project, domain, ali_dns_root: default_dns_root } = await request.json();

    if (!domain) {
        return NextResponse.json({ error: "Missing domain" }, { status: 400 });
    }

    // 动态判断正确的阿里 DNS 根域名 (比如收集所有 config 中的 ali_dns 作为白名单)
    const knownRoots = Object.values(PROJECTS_CONFIG)
        .map((p: any) => p.ali_dns)
        .filter(Boolean);
    // 去重
    const uniqueRoots = Array.from(new Set(knownRoots)) as string[];

    let targetDnsRoot = default_dns_root;
    for (const root of uniqueRoots) {
        if (domain.endsWith(root)) {
            targetDnsRoot = root;
            break;
        }
    }

    if (!targetDnsRoot) {
        return NextResponse.json({ error: "Cannot determine DNS root for the given domain" }, { status: 400 });
    }

    try {
        // 2. 将域名添加到 Vercel
        const projConfig = PROJECTS_CONFIG[project] || PROJECTS_CONFIG['magic'];
        const vId = process.env[projConfig.vercel_env_key];
        const vcRes = await fetch(`https://api.vercel.com/v10/projects/${vId}/domains`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: domain })
        });

        if (!vcRes.ok) {
            const errorData = await vcRes.json();
            return NextResponse.json({ error: `Vercel Error: ${errorData.error?.message || 'Unknown'}` }, { status: vcRes.status });
        }

        // 3. 计算用于阿里云解析的 RR 值
        // 例如 domain = test.yhwlwl.xyz, ali_dnsRoot = yhwlwl.xyz, 那么 rr 就是 test
        let rr = domain.replace(`.${targetDnsRoot}`, '');
        if (rr === domain) {
            // 没替换掉说明可能是根域名，那就是 @
            rr = '@';
        }

        // 4. 调用阿里云 SDK 添加 CNAME
        const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID || process.env.ALIBABA_CLOUD_ACCESS_KEY_ID;
        const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET || process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET;

        if (!accessKeyId || !accessKeySecret) {
            return NextResponse.json({ error: "服务器未配置阿里云 AccessKey 环境变量喵，请检查 .env.local 并重启服务" }, { status: 500 });
        }

        const config = new $OpenApi.Config({
            accessKeyId,
            accessKeySecret,
        });
        config.endpoint = `alidns.cn-hangzhou.aliyuncs.com`;
        const client = new Alidns20150109(config);

        const addDomainRecordRequest = new $Alidns20150109.AddDomainRecordRequest({
            domainName: targetDnsRoot,
            RR: rr,
            type: "CNAME",
            value: "cname.vercel-dns.com",
        });

        try {
            await client.addDomainRecord(addDomainRecordRequest);
        } catch (aliError: any) {
            // 如果报错说明已经有了或者 SDK 调用失败
            console.error("Aliyun DNS Error:", aliError);
            return NextResponse.json({
                error: `添加到Vercel成功，但在阿里云添加解析失败: ${aliError.message || 'Unknown'}`
            }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: "域名添加并解析成功喵！" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "内部错误喵..." }, { status: 500 });
    }
}
