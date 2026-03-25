import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession, logAudit } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { authRegisterSchema } from '@/lib/validators';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  const ip = getClientIp(request.headers);
  const rate = rateLimit(`register:${ip}`, 5, 10 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json({ error: 'Слишком много попыток регистрации. Повторите позже.' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = authRegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: 'Пользователь с таким email уже зарегистрирован.' }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: hashPassword(parsed.data.password),
      role: 'AUTHOR'
    }
  });

  await createSession(user.id, {
    userAgent: request.headers.get('user-agent'),
    ipAddress: ip
  });
  await logAudit(user.id, 'register', 'user', user.id, 'Самостоятельная регистрация автора');

  return NextResponse.json({ ok: true, redirectTo: '/cabinet' });
}
