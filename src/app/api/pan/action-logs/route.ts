import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit') || '10';

  if (!supabase) {
    return NextResponse.json({ error: 'Supabase 未配置' }, { status: 500 });
  }

  try {
    let query = supabase
      .from('bdpan_action_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (limitParam !== 'all') {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        query = query.limit(parsedLimit);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('[pan-action-logs API] error:', error);
      return NextResponse.json({ error: '读取网盘操作日志失败' }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
