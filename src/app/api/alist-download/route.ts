import { NextResponse } from 'next/server';

const ALIST_URL = (process.env.ALIST_URL || 'http://47.108.222.119:5244').replace(/\/+$/, '');
const ALIST_USERNAME = process.env.ALIST_USERNAME || '';
const ALIST_PASSWORD = process.env.ALIST_PASSWORD || '';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAlistToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken!;
    const res = await fetch(`${ALIST_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: ALIST_USERNAME, password: ALIST_PASSWORD }),
    });
    const data = await res.json();
    if (data.code !== 200 || !data.data?.token) throw new Error(data.message || 'AList 登录失败');
    cachedToken = data.data.token;
    tokenExpiry = Date.now() + 47 * 60 * 60 * 1000;
    return cachedToken!;
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const path = searchParams.get('path');
        if (!path) {
            return NextResponse.json({ error: '缺少 path 参数' }, { status: 400 });
        }

        // 1. 从 AList 获取文件的 raw_url（真实的百度CDN直链）
        const token = await getAlistToken();
        const getRes = await fetch(`${ALIST_URL}/api/fs/get`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,
            },
            body: JSON.stringify({ path }),
        });
        const getData = await getRes.json();

        if (getData.code !== 200 || !getData.data?.raw_url) {
            return NextResponse.json(
                { error: getData.message || '获取文件直链失败' },
                { status: 500 }
            );
        }

        const rawUrl = getData.data.raw_url;
        const filename = path.split('/').pop() || 'download';

        // 2. 根据存储后端设置合适的请求头
        const rangeHeader = request.headers.get('range');
        const fetchHeaders: Record<string, string> = {};
        // 只对百度 CDN 链接设置 pan.baidu.com UA
        if (rawUrl.includes('baidupcs.com') || rawUrl.includes('baidu.com')) {
            fetchHeaders['User-Agent'] = 'pan.baidu.com';
        }
        if (rangeHeader) fetchHeaders['Range'] = rangeHeader;

        const fileRes = await fetch(rawUrl, { headers: fetchHeaders });

        if (!fileRes.ok && fileRes.status !== 206) {
            return NextResponse.json(
                { error: `百度CDN返回错误: ${fileRes.status}` },
                { status: fileRes.status }
            );
        }

        // 3. 将响应流式传回给前端（支持断点续传）
        const responseHeaders = new Headers();
        responseHeaders.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`);

        const contentType = fileRes.headers.get('Content-Type') || 'application/octet-stream';
        responseHeaders.set('Content-Type', contentType);

        const contentLength = fileRes.headers.get('Content-Length');
        if (contentLength) responseHeaders.set('Content-Length', contentLength);

        const contentRange = fileRes.headers.get('Content-Range');
        if (contentRange) responseHeaders.set('Content-Range', contentRange);

        if (rangeHeader && contentRange) {
            responseHeaders.set('Accept-Ranges', 'bytes');
        }

        return new Response(fileRes.body, {
            status: fileRes.status,
            headers: responseHeaders,
        });

    } catch (e: any) {
        console.error('[alist-download] error:', e);
        return NextResponse.json(
            { error: e?.message || '下载代理出错喵...' },
            { status: 500 }
        );
    }
}
