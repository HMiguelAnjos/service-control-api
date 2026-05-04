import crypto from 'crypto';

/**
 * AES-256-GCM encryption for OAuth tokens stored in the DB.
 *
 * Key: 32 bytes provided via env var `CALENDAR_TOKEN_ENCRYPTION_KEY` as a hex
 * string (64 hex chars).  Generate one with `openssl rand -hex 32`.
 *
 * Output format (base64): `<12-byte-iv><16-byte-auth-tag><ciphertext>`
 */
const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey(): Buffer {
  const hex = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'CALENDAR_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes). ' +
        'Generate one with `openssl rand -hex 32`.',
    );
  }
  return Buffer.from(hex, 'hex');
}

export function encryptToken(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LEN);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString('base64');
}

export function decryptToken(blob: string): string {
  const key = getKey();
  const buf = Buffer.from(blob, 'base64');
  if (buf.length < IV_LEN + TAG_LEN + 1) throw new Error('Invalid encrypted token blob.');
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const ciphertext = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString('utf8');
}
