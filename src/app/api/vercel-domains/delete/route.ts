import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../_auth';
import { PROJECTS_CONFIG } from '@/lib/config';

export async function DELETE(request: Request) {
    const authHeader = request.headers.get('authorization') || undefined;
    if (!verifyAdminToken(authHeader)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    const project = searchParams.get('project') || 'magic';

    if (!domain) {
        return NextResponse.json({ error: "Missing domain parameter" }, { status: 400 });
    }

    try {
        const projConfig = PROJECTS_CONFIG[project] || PROJECTS_CONFIG['magic'];
        const vId = process.env[projConfig.vercel_env_key];
        const res = await fetch(`https://api.vercel.com/v9/projects/${vId}/domains/${domain}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
            }
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ error: `Vercel Error: ${errorData.error?.message || 'Unknown'}` }, { status: res.status });
        }

        return NextResponse.json({ success: true, message: "域名删除成功喵！" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "内部错误喵..." }, { status: 500 });
    }
}
