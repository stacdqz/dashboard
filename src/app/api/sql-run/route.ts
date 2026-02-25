import { NextResponse } from 'next/server';
import { Client } from 'pg';
import { verifyAdminToken } from '../_auth';

const dbUrl = process.env.SUPABASE_DB_URL;

export async function POST(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';
  const allowProd = process.env.SQL_CONSOLE_ALLOW_PROD === 'true';

  if (isProd && !allowProd) {
    return NextResponse.json(
      { error: 'SQL 控制台已在生产环境禁用喵。' },
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

  if (!dbUrl) {
    return NextResponse.json(
      { error: '缺少 SUPABASE_DB_URL 数据库连接串喵，请在环境变量中配置。' },
      { status: 500 },
    );
  }

  const { sql } = await request.json().catch(() => ({ sql: '' }));
  const raw = (sql || '').toString().trim();

  if (!raw) {
    return NextResponse.json({ error: 'SQL 不能为空喵...' }, { status: 400 });
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query(raw);

    return NextResponse.json({
      rows: result.rows ?? [],
      rowCount: result.rowCount,
      command: result.command,
    });
  } catch (e: any) {
    console.error('[sql-run] error:', e);
    return NextResponse.json(
      { error: e?.message || 'SQL 执行失败喵...' },
      { status: 500 },
    );
  } finally {
    await client.end().catch(() => {});
  }
}

