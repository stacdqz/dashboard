import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    '[view-logs API] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get('project') || 'magic';
  const limitParam = searchParams.get('limit') || '10';

  if (!supabase) {
    return NextResponse.json(
      { error: 'Supabase 环境变量未配置喵...' },
      { status: 500 },
    );
  }

  try {
    let query = supabase
      .from('view_logs')
      .select('id, visit_time, ip_address, city, region, country')
      .eq('page_source', project)
      .order('visit_time', { ascending: false });

    if (limitParam !== 'all') {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[view-logs API] Supabase query error:', error);
      return NextResponse.json(
        { error: '读取访问日志失败喵...' },
        { status: 500 },
      );
    }

    return NextResponse.json({ logs: data ?? [] });
  } catch (e) {
    console.error('[view-logs API] Unexpected error:', e);
    return NextResponse.json(
      { error: '访问日志接口异常喵...' },
      { status: 500 },
    );
  }
}

