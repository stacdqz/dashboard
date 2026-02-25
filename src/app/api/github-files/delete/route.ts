import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../_auth';

export async function DELETE(request: Request) {
    const authHeader = request.headers.get('authorization') || undefined;
    if (!verifyAdminToken(authHeader)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { repo, path, sha } = body;

    if (!repo || !path || !sha) {
        return NextResponse.json({ error: "Missing repo, path or sha parameters" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete ${path} via ZERO_OS`,
                sha: sha
            })
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return NextResponse.json({ error: `GitHub Error: ${errorData.message || 'Unknown'}` }, { status: res.status });
        }

        return NextResponse.json({ success: true, message: "文件删除成功喵！" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "内部错误喵..." }, { status: 500 });
    }
}
