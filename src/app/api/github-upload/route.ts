import { NextResponse } from 'next/server';
import { verifyAdminToken } from '../_auth';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';
  const allowProd = process.env.GITHUB_UPLOAD_ALLOW_PROD === 'true';

  if (isProd && !allowProd) {
    return NextResponse.json(
      { error: 'GitHub 一键上传已在生产环境禁用喵。' },
      { status: 403 },
    );
  }

  const authHeader = request.headers.get('authorization') || undefined;
  if (!verifyAdminToken(authHeader)) {
    return NextResponse.json(
      { error: '未登录或登录已过期喵...' },
      { status: 401 },
    );
  }

  if (!GITHUB_TOKEN) {
    return NextResponse.json(
      { error: '后端缺少 GITHUB_TOKEN 环境变量喵...' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { repo, filename, content } = body as {
    repo?: string;
    filename?: string;
    content?: string;
  };

  if (!repo || !filename || !content) {
    return NextResponse.json(
      { error: 'repo / filename / content 不能为空喵...' },
      { status: 400 },
    );
  }

  const path = filename.replace(/^\/+/, '');
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${encodeURIComponent(
    path,
  )}`;

  // 先查一下这个路径是否已经存在，如果存在就拿到 sha 做覆盖喵
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });
    if (getRes.ok) {
      const getData = await getRes.json();
      if (getData && typeof getData.sha === 'string') {
        existingSha = getData.sha;
      }
    }
  } catch {
    // 查不到没关系，当作新文件处理喵
  }

  const payload: any = {
    message: `chore: upload ${path} from ZERO_OS`,
    content: Buffer.from(content, 'utf8').toString('base64'),
  };

  if (existingSha) {
    payload.sha = existingSha;
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('[github-upload] error:', data);
      return NextResponse.json(
        { error: data.message || '上传到 GitHub 失败喵...' },
        { status: res.status },
      );
    }

    return NextResponse.json({
      path: data.content?.path,
      html_url: data.content?.html_url,
    });
  } catch (e) {
    console.error('[github-upload] unexpected error:', e);
    return NextResponse.json(
      { error: 'GitHub 上传接口异常喵...' },
      { status: 500 },
    );
  }
}


