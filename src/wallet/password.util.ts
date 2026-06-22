import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

/**
 * Password hashing helpers backed by Node's built-in `scrypt` (no extra
 * dependency). The stored format is a self-describing string:
 *
 *   `scrypt$<saltHex>$<hashHex>`
 *
 * The salt is per-password, so two users with the same password produce
 * different hashes. Verification is constant-time via `timingSafeEqual`.
 */

const SCHEME = 'scrypt';
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const derived = scryptSync(password, salt, KEY_BYTES);
  return `${SCHEME}$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  const [scheme, saltHex, hashHex] = stored.split('$');
  if (scheme !== SCHEME || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}
