import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.VERCEL_TOKEN;
  const teamId = 'team_yhwls-projects';
  const projectId = 'pan'; // or whatever the actual project id is

  if (!token) {
    return NextResponse.json({ error: 'Missing VERCEL_TOKEN' }, { status: 500 });
  }

  const now = new Date();
  const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const fromStr = from.toISOString();
  const toStr = now.toISOString();

  // Try fetching v1 usage API.
  let url = `https://api.vercel.com/v1/usage?metrics=fastOriginTransfer&from=${encodeURIComponent(fromStr)}&to=${encodeURIComponent(toStr)}&teamId=${teamId}`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // If it fails with 403 or 400, it's normal as per our tests. We just return it.
    const data = await res.json();
    return NextResponse.json({ status: res.status, data });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch Vercel usage', message: error.message }, { status: 500 });
  }
}
