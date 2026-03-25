import { NextResponse } from 'next/server';
import { clearSession, getCurrentUser, logAudit } from '@/lib/auth';

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await logAudit(user.id, 'logout', 'user', user.id, 'Выход из системы');
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
