import jwt from 'jsonwebtoken';

interface StatePayload {
  userId: number;
  nonce: string;
}

/**
 * Signs/verifies the OAuth `state` parameter so the callback knows which user
 * is connecting and that the request originated from us (CSRF protection).
 *
 * Reuses JWT_SECRET — short TTL (5 minutes) since OAuth flow is fast.
 */
export function signOAuthState(userId: number): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  const nonce = Math.random().toString(36).slice(2);
  return jwt.sign({ userId, nonce } as StatePayload, secret, { expiresIn: '5m' });
}

export function verifyOAuthState(state: string): StatePayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');
  return jwt.verify(state, secret) as StatePayload;
}
