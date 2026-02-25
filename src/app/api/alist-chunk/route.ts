import { NextResponse } from 'next/server';

// 允许代理的百度域名白名单
const ALLOWED_DOMAINS = [
    'baidupcs.com',
    'baidu.com',
    'bdstatic.com',
    'baidupan.com',
    'popin.cc',
    'bcebos.com',
];

function isAllowedUrl(url: string): boolean {
    try {
        const hostname = new URL(url).hostname;
        return ALLOWED_DOMAINS.some(d => hostname.endsWith(d));
    } catch {
        return false;
    }
}

export async function POST(request: Request) {
    try {
        const { url, rangeStart, rangeEnd } = await request.json();
        if (!url || typeof url !== 'string') {
            return NextResponse.json({ error: '缺少 url 参数' }, { status: 400 });
        }
        if (!isAllowedUrl(url)) {
            return NextResponse.json({ error: '不允许代理该域名' }, { status: 403 });
        }

        const headers: Record<string, string> = {
            'User-Agent': 'pan.baidu.com',
        };

        // 分块下载支持
        if (rangeStart !== undefined && rangeEnd !== undefined) {
            headers['Range'] = `bytes=${rangeStart}-${rangeEnd}`;
        }

        const res = await fetch(url, { headers });

        if (!res.ok && res.status !== 206) {
            return NextResponse.json(
                { error: `百度CDN返回: ${res.status}` },
                { status: res.status },
            );
        }

        // 流式传回
        const responseHeaders = new Headers();
        const ct = res.headers.get('Content-Type');
        if (ct) responseHeaders.set('Content-Type', ct);
        const cl = res.headers.get('Content-Length');
        if (cl) responseHeaders.set('Content-Length', cl);
        const cr = res.headers.get('Content-Range');
        if (cr) responseHeaders.set('Content-Range', cr);

        return new Response(res.body, {
            status: res.status,
            headers: responseHeaders,
        });
    } catch (e: any) {
        console.error('[alist-chunk] error:', e);
        return NextResponse.json({ error: e?.message || '分块代理出错' }, { status: 500 });
    }
}
