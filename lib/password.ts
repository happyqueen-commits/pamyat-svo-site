import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, originalHash] = stored.split(':');
  if (!salt || !originalHash) return false;
  const hashedBuffer = Buffer.from(originalHash, 'hex');
  const candidateBuffer = scryptSync(password, salt, KEY_LENGTH);
  if (hashedBuffer.length !== candidateBuffer.length) return false;
  return timingSafeEqual(hashedBuffer, candidateBuffer);
}
