import { NextResponse } from 'next/server';
import { getCurrentUser, logAudit } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { roleUpdateSchema } from '@/lib/validators';
import { ensureSameOrigin } from '@/lib/csrf';

export async function PATCH(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  const actor = await getCurrentUser();
  if (!actor || actor.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Недостаточно прав.' }, { status: 403 });
  }

  const { userId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = roleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: parsed.data.role, isActive: parsed.data.isActive }
  });

  await logAudit(actor.id, 'update_role', 'user', userId, `Назначена роль ${user.role}; active=${user.isActive}`);
  return NextResponse.json({ ok: true, user });
}
