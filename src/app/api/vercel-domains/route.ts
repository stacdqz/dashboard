import { NextResponse } from 'next/server';
import { PROJECTS_CONFIG } from '@/lib/config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const project = searchParams.get('project') || 'magic';
    const projConfig = PROJECTS_CONFIG[project] || PROJECTS_CONFIG['magic'];
    const vId = process.env[projConfig.vercel_env_key];

    try {
        const res = await fetch(`https://api.vercel.com/v9/projects/${vId}/domains`, {
            headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` },
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch from Vercel APIs." }, { status: res.status });
        }

        const data = await res.json();
        const domains = data.domains || [];

        // 检查每个域名的真实解析状态 (基于 v6/domains/:domain/config)
        const domainsWithRealStatus = await Promise.all(
            domains.map(async (domain: any) => {
                try {
                    const confRes = await fetch(`https://api.vercel.com/v6/domains/${domain.name}/config`, {
                        headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` },
                        // 不要加 revalidate，让状态尽量实时，或者很短的缓存
                        cache: 'no-store'
                    });
                    if (confRes.ok) {
                        const confData = await confRes.json();
                        // 真实的 verifying 状态: 如果没有 misconfigured 则为 verified
                        domain.verified = !confData.misconfigured;
                    }
                } catch {
                    // ignore error and keep original verified flag
                }
                return domain;
            })
        );

        return NextResponse.json({ domains: domainsWithRealStatus });
    } catch (error) {
        return NextResponse.json({ error: "Vercel Domains 抓取失败喵..." }, { status: 500 });
    }
}
