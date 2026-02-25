import { NextResponse } from 'next/server';
import { signAdminToken } from '../_auth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: '后端缺少 ADMIN_PASSWORD 环境变量喵...' },
      { status: 500 },
    );
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json(
      { error: '密码不对喵...' },
      { status: 401 },
    );
  }

  const token = signAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: '后端缺少 ADMIN_TOKEN_SECRET 环境变量喵...' },
      { status: 500 },
    );
  }

  return NextResponse.json({ token });
}

