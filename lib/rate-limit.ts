const globalStore = globalThis as typeof globalThis & {
  __rateLimitStore?: Map<string, { count: number; resetAt: number }>;
};

const store = globalStore.__rateLimitStore ?? new Map<string, { count: number; resetAt: number }>();
globalStore.__rateLimitStore = store;

export function getClientIp(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return headers.get('x-real-ip') || 'unknown';
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  if (current.count >= limit) {
    return { ok: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }
  current.count += 1;
  store.set(key, current);
  return { ok: true, remaining: limit - current.count };
}
