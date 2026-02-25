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
    const limitParam = searchParams.get('limit') || '10';

    if (!supabase) {
        return NextResponse.json(
            { error: 'Supabase 环境变量未配置喵...' },
            { status: 500 },
        );
    }

    try {
        // 获取所有该项目的访问记录
        const { data, error } = await supabase
            .from('view_logs')
            .select('ip_address, visit_time, city, region, country')
            .eq('page_source', project);

        if (error) {
            console.error('[ip-stats API] Supabase query error:', error);
            return NextResponse.json(
                { error: '读取IP统计失败喵...' },
                { status: 500 },
            );
        }

        // 在内存中按 IP 分组统计
        const ipMap: Record<string, {
            ip: string;
            count: number;
            firstVisit: string;
            lastVisit: string;
            city: string;
            region: string;
            country: string;
        }> = {};

        for (const row of (data || [])) {
            const ip = row.ip_address || 'unknown';
            if (!ipMap[ip]) {
                ipMap[ip] = {
                    ip,
                    count: 0,
                    firstVisit: row.visit_time,
                    lastVisit: row.visit_time,
                    city: row.city || '',
                    region: row.region || '',
                    country: row.country || '',
                };
            }
            ipMap[ip].count++;
            if (row.visit_time < ipMap[ip].firstVisit) ipMap[ip].firstVisit = row.visit_time;
            if (row.visit_time > ipMap[ip].lastVisit) ipMap[ip].lastVisit = row.visit_time;
            // 用最新的地理位置信息
            if (row.city) ipMap[ip].city = row.city;
            if (row.region) ipMap[ip].region = row.region;
            if (row.country) ipMap[ip].country = row.country;
        }

        // 按访问次数从高到低排序
        let stats = Object.values(ipMap).sort((a, b) => b.count - a.count);

        // 应用 limit
        if (limitParam !== 'all') {
            const parsedLimit = parseInt(limitParam, 10);
            if (!isNaN(parsedLimit) && parsedLimit > 0) {
                stats = stats.slice(0, parsedLimit);
            }
        }

        return NextResponse.json({
            stats,
            totalIPs: Object.keys(ipMap).length,
            totalVisits: data?.length || 0,
        });
    } catch (e) {
        console.error('[ip-stats API] Unexpected error:', e);
        return NextResponse.json(
            { error: 'IP统计接口异常喵...' },
            { status: 500 },
        );
    }
}
