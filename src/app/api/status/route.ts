import { NextResponse } from 'next/server';
import { PROJECTS_CONFIG } from '@/lib/config';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project') || 'magic';
  const projConfig = PROJECTS_CONFIG[project] || PROJECTS_CONFIG['magic'];

  try {
    // 1. 抓取 GitHub 最新提交记录
    const ghRes = await fetch(`https://api.github.com/repos/${projConfig.github_repo}/commits?per_page=1`, {
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      },
      next: { revalidate: 60 } // 缓存60秒，保护哥哥的 API 配额喵
    });
    const ghData = await ghRes.json();

    // 2. 抓取 Vercel 部署状态
    // 注意这里用了环境变量里的 PROJECT_ID 喵！
    const vKey = projConfig.vercel_env_key;
    const vId = process.env[vKey];
    const vcRes = await fetch(`https://api.vercel.com/v6/deployments?projectId=${vId}&limit=1`, {
      headers: { 'Authorization': `Bearer ${process.env.VERCEL_TOKEN}` },
      next: { revalidate: 60 }
    });
    const vcData = await vcRes.json();

    return NextResponse.json({
      github: {
        lastCommit: ghData[0]?.commit?.message || "无记录",
        author: ghData[0]?.commit?.author?.name || "未知",
        date: ghData[0]?.commit?.author?.date || null
      },
      vercel: {
        status: vcData.deployments?.[0]?.state || "READY",
        url: vcData.deployments?.[0]?.url || ""
      },
      system: {
        memory: "8GB",
        status: "OPTIMIZED"
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "数据抓取失败喵..." }, { status: 500 });
  }
}