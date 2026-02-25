import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../../_auth';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization') || undefined;
    if (!verifyAdminToken(authHeader)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { repo, oldPath, newPath, sha } = body;

    if (!repo || !oldPath || !newPath || !sha) {
        return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    try {
        // 1. 获取旧文件内容 (为了复制过去)
        const getRes = await fetch(`https://api.github.com/repos/${repo}/contents/${oldPath}`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!getRes.ok) {
            return NextResponse.json({ error: `Failed to fetch old file.` }, { status: getRes.status });
        }
        const fileData = await getRes.json();
        const contentBase64 = fileData.content; // It's already base64

        // 2. 创建新文件
        const putRes = await fetch(`https://api.github.com/repos/${repo}/contents/${newPath}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Rename ${oldPath} to ${newPath} via ZERO_OS`,
                content: contentBase64
            })
        });

        if (!putRes.ok) {
            const errorData = await putRes.json().catch(() => ({}));
            return NextResponse.json({ error: `Failed to create new file: ${errorData.message}` }, { status: putRes.status });
        }

        // 3. 删除旧文件
        const delRes = await fetch(`https://api.github.com/repos/${repo}/contents/${oldPath}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete old file ${oldPath} after renaming via ZERO_OS`,
                sha: sha
            })
        });

        if (!delRes.ok) {
            // 我们忽略删除的严格报错，因为新文件已经建好了
            console.error("Old file deletion failed but new file was put");
        }

        return NextResponse.json({ success: true, message: "文件重命名成功喵！" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "内部错误喵..." }, { status: 500 });
    }
}
