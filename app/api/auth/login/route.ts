import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, getDefaultRedirect, logAudit } from '@/lib/auth';
import { verifyPassword } from '@/lib/password';
import { authLoginSchema } from '@/lib/validators';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rate = rateLimit(`login:${ip}`, 10, 10 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json({ error: 'Слишком много попыток входа. Повторите позже.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = authLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: 'Неверный email или пароль.' }, { status: 401 });
  }

  await createSession(user.id, {
    userAgent: request.headers.get('user-agent'),
    ipAddress: ip
  });
  await logAudit(user.id, 'login', 'user', user.id, 'Вход в систему');

  return NextResponse.json({ ok: true, redirectTo: getDefaultRedirect(user.role) });
}
