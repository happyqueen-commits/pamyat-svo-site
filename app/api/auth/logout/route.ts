import { NextResponse } from 'next/server';
import { clearSession, getCurrentUser, logAudit } from '@/lib/auth';
import { ensureSameOrigin } from '@/lib/csrf';

export async function POST(request: Request) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  const user = await getCurrentUser();
  if (user) {
    await logAudit(user.id, 'logout', 'user', user.id, 'Выход из системы');
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
