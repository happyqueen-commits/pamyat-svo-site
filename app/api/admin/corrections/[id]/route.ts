import { NextResponse } from 'next/server';
import { getCurrentUser, logAudit } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { correctionStatusSchema } from '@/lib/validators';
import { ensureSameOrigin } from '@/lib/csrf';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const csrfError = ensureSameOrigin(request);
  if (csrfError) return csrfError;

  const actor = await getCurrentUser();
  if (!actor || !['MODERATOR', 'ADMIN'].includes(actor.role)) {
    return NextResponse.json({ error: 'Недостаточно прав.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = correctionStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Некорректные данные' }, { status: 400 });
  }

  const item = await prisma.correctionRequest.update({ where: { id }, data: { status: parsed.data.status } });
  await logAudit(actor.id, 'update_correction', 'correctionRequest', id, `Статус: ${item.status}`);
  return NextResponse.json({ ok: true, item });
}
