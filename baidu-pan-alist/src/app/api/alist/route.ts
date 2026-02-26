import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../_auth';

const ALIST_URL = (process.env.ALIST_URL || 'http://47.108.222.119:5244').replace(/\/+$/, '');
const ALIST_USERNAME = process.env.ALIST_USERNAME || '';
const ALIST_PASSWORD = process.env.ALIST_PASSWORD || '';

let cachedToken: string | null = null;
let tokenExpiry = 0;

async function getAlistToken(): Promise<string> {
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    const res = await fetch(`${ALIST_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: ALIST_USERNAME,
            password: ALIST_PASSWORD,
        }),
    });

    const data = await res.json();
    if (data.code !== 200 || !data.data?.token) {
        throw new Error(data.message || 'AList 登录失败');
    }

    cachedToken = data.data.token;
    tokenExpiry = Date.now() + 47 * 60 * 60 * 1000;
    return cachedToken!;
}

async function alistFetch(endpoint: string, body: any) {
    const token = await getAlistToken();
    const res = await fetch(`${ALIST_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,
        },
        body: JSON.stringify(body),
    });
    return res.json();
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { action, path, name, names, newName, dir_name } = body as {
            action: string;
            path?: string;
            name?: string;
            names?: string[];
            newName?: string;
            dir_name?: string;
        };

        if (!action) {
            return NextResponse.json({ code: 400, message: '缺少 action 参数' }, { status: 400 });
        }

        const writeActions = ['mkdir', 'remove', 'rename'];
        if (writeActions.includes(action)) {
            const authHeader = request.headers.get('authorization') || undefined;
            if (!verifyAdminToken(authHeader)) {
                return NextResponse.json({ code: 401, message: '需要管理员权限喵...' }, { status: 401 });
            }
        }

        let result: any;

        switch (action) {
            case 'list':
                result = await alistFetch('/api/fs/list', {
                    path: path || '/',
                    page: 1,
                    per_page: 0,
                    refresh: false,
                });
                break;

            case 'get':
                result = await alistFetch('/api/fs/get', {
                    path: path || '/',
                });
                break;

            case 'mkdir':
                result = await alistFetch('/api/fs/mkdir', {
                    path: `${(path || '/').replace(/\/+$/, '')}/${dir_name}`,
                });
                break;

            case 'remove':
                result = await alistFetch('/api/fs/remove', {
                    dir: path || '/',
                    names: names || (name ? [name] : []),
                });
                break;

            case 'rename':
                result = await alistFetch('/api/fs/rename', {
                    path: path || '/',
                    name: (newName || '').trim(),
                });
                break;

            default:
                return NextResponse.json({ code: 400, message: `未知操作: ${action}` }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (e: any) {
        console.error('[alist] error:', e);
        return NextResponse.json(
            { code: 500, message: e?.message || 'AList 代理出错喵...' },
            { status: 500 },
        );
    }
}
