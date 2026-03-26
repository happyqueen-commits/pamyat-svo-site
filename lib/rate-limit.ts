import { prisma } from '@/lib/prisma';

export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip') || 'unknown';
}

let lastCleanupAt = 0;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

export async function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const nowDate = new Date(now);
  const resetAt = new Date(now + windowMs);

  if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now;
    await prisma.rateLimitEntry.deleteMany({
      where: { resetAt: { lt: nowDate } }
    });
  }

  const current = await prisma.rateLimitEntry.findUnique({ where: { key } });
  if (!current || current.resetAt.getTime() < now) {
    await prisma.rateLimitEntry.upsert({
      where: { key },
      update: { count: 1, resetAt },
      create: { key, count: 1, resetAt }
    });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: current.resetAt.getTime() - now };
  }

  const updated = await prisma.rateLimitEntry.update({
    where: { key },
    data: { count: { increment: 1 } },
    select: { count: true }
  });

  return { ok: true, remaining: limit - updated.count };
}
