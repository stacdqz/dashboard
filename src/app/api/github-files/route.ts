import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const repo = searchParams.get('repo');

    if (!repo) {
        return NextResponse.json({ error: "Missing repo parameter" }, { status: 400 });
    }

    try {
        const res = await fetch(`https://api.github.com/repos/${repo}/contents`, {
            headers: {
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch from GitHub." }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json({ files: data });
    } catch (error) {
        return NextResponse.json({ error: "GitHub Files 抓取失败喵..." }, { status: 500 });
    }
}
