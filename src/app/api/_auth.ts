import crypto from 'crypto';

const TOKEN_TTL_MS = 2 * 60 * 60 * 1000; // 2 小时

function getSecret() {
  return process.env.ADMIN_TOKEN_SECRET || '';
}

export function signAdminToken() {
  const secret = getSecret();
  if (!secret) return null;

  const payload = {
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf8').toString('base64url');

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const sig = hmac.digest('hex');

  return `${payloadB64}.${sig}`;
}

export type AdminTokenVerifyResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | 'missing_secret'
        | 'missing_token'
        | 'bad_format'
        | 'bad_sig'
        | 'bad_payload'
        | 'expired';
    };

function verifyAdminTokenValueDetailed(token: string): AdminTokenVerifyResult {
  const secret = getSecret();
  if (!secret) return { ok: false, reason: 'missing_secret' };

  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) return { ok: false, reason: 'bad_format' };

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payloadB64);
  const expectedSig = hmac.digest('hex');
  if (expectedSig !== sig) return { ok: false, reason: 'bad_sig' };

  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadStr) as { exp?: number };
    if (!payload.exp || typeof payload.exp !== 'number') {
      return { ok: false, reason: 'bad_payload' };
    }
    if (Date.now() > payload.exp) return { ok: false, reason: 'expired' };
    return { ok: true };
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }
}

export function verifyAdminTokenDetailed(
  authHeaderOrToken?: string,
): AdminTokenVerifyResult {
  if (!authHeaderOrToken) return { ok: false, reason: 'missing_token' };

  const trimmed = authHeaderOrToken.trim();

  if (trimmed.toLowerCase().startsWith('bearer ')) {
    const token = trimmed.slice('bearer '.length).trim();
    if (!token) return { ok: false, reason: 'missing_token' };
    return verifyAdminTokenValueDetailed(token);
  }

  if (!trimmed) return { ok: false, reason: 'missing_token' };
  return verifyAdminTokenValueDetailed(trimmed);
}

export function verifyAdminToken(authHeaderOrToken?: string): boolean {
  return verifyAdminTokenDetailed(authHeaderOrToken).ok;
}
