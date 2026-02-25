import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project') || 'magic';

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase 环境变量未配置喵...' },
      { status: 500 },
    );
  }

  try {
    const { count, error } = await supabase
      .from('view_logs')
      .select('*', { count: 'exact', head: true })
      .eq('page_source', project);

    if (error) {
      console.error('[total-requests API] Supabase count error:', error);
      return NextResponse.json(
        { error: '读取总请求数失败喵...' },
        { status: 500 },
      );
    }

    return NextResponse.json({ totalRequests: count ?? 0 });
  } catch (e) {
    console.error('[total-requests API] Unexpected error:', e);
    return NextResponse.json(
      { error: '总请求数接口异常喵...' },
      { status: 500 },
    );
  }
}

