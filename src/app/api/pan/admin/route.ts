import { NextResponse } from 'next/server';
import { verifyAdminTokenDetailed } from '../../_auth';

export async function POST(request: Request) {
  // 1. Verify dashboard admin token
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized Dashboard Access' }, { status: 401 });
  }

  const auth = verifyAdminTokenDetailed(authHeader);
  if (!auth.ok) {
    if (auth.reason === 'missing_secret') {
      return NextResponse.json(
        { error: 'Server misconfigured: missing ADMIN_TOKEN_SECRET' },
        { status: 500 },
      );
    }
    const error =
      auth.reason === 'expired'
        ? 'Dashboard Token Expired'
        : 'Invalid Dashboard Token';
    return NextResponse.json({ error, reason: auth.reason }, { status: 401 });
  }

  // 2. Prepare request to Netdisk project
  const panApiUrl = process.env.NEXT_PUBLIC_PAN_API_URL || 'https://pan.cdqzsta.tech';
  const panAdminPassword = process.env.PAN_ADMIN_PASSWORD || '123456';

  try {
    const body = await request.json();

    // First, login to Netdisk to get a token if we don't have a reliable way to sign one here
    // Or we can assume we need to pass the login request if it's a login action, 
    // but the implementation plan says "Forward requests to Netdisk's /api/users endpoint with proper auth."

    // We need an admin token for the Netdisk project.
    // Instead of logging in every time, we can sign a token if we had the SECRET, 
    // but it's safer to just login or use a shared secret if possible.
    // Since we have the Netdisk ADMIN_PASSWORD, let's login to get a token.

    const loginRes = await fetch(`${panApiUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: panAdminPassword }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      return NextResponse.json({ error: 'Failed to authenticate with Netdisk API', details: loginData }, { status: 500 });
    }

    const panToken = loginData.token;

    // 3. Forward the management request to Netdisk
    const panRes = await fetch(`${panApiUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${panToken}`
      },
      body: JSON.stringify(body),
    });

    const panData = await panRes.json();
    return NextResponse.json(panData, { status: panRes.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET: Proxy to fetch users/settings
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized Dashboard Access' }, { status: 401 });
  }

  const auth = verifyAdminTokenDetailed(authHeader);
  if (!auth.ok) {
    if (auth.reason === 'missing_secret') {
      return NextResponse.json(
        { error: 'Server misconfigured: missing ADMIN_TOKEN_SECRET' },
        { status: 500 },
      );
    }
    const error =
      auth.reason === 'expired'
        ? 'Dashboard Token Expired'
        : 'Invalid Dashboard Token';
    return NextResponse.json({ error, reason: auth.reason }, { status: 401 });
  }

  const panApiUrl = process.env.NEXT_PUBLIC_PAN_API_URL || 'https://pan.cdqzsta.tech';
  const panAdminPassword = process.env.PAN_ADMIN_PASSWORD || '123456';

  try {
    const loginRes = await fetch(`${panApiUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: panAdminPassword }),
    });

    const loginData = await loginRes.json();
    if (!loginRes.ok || !loginData.token) {
      return NextResponse.json({ error: 'Failed to authenticate with Netdisk API' }, { status: 500 });
    }

    const panToken = loginData.token;

    const panRes = await fetch(`${panApiUrl}/api/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${panToken}`
      },
    });

    const panData = await panRes.json();
    return NextResponse.json(panData, { status: panRes.status });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
