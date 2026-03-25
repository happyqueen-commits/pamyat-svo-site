import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, logAudit } from '@/lib/auth';

const actionMap = {
  approve: 'APPROVED',
  reject: 'REJECTED',
  archive: 'ARCHIVED'
} as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ submissionId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !['MODERATOR', 'ADMIN'].includes(user.role)) {
    return NextResponse.json({ error: 'Недостаточно прав для модерации.' }, { status: 403 });
  }

  const { submissionId } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action as 'approve' | 'reject' | 'archive' | 'verify' | undefined;

  if (!action || !['approve', 'reject', 'archive', 'verify'].includes(action)) {
    return NextResponse.json({ error: 'Некорректное действие' }, { status: 400 });
  }

  const submission = await prisma.submission.findUnique({ where: { id: submissionId }, include: { person: true } });
  if (!submission) {
    return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });
  }

  if (action === 'verify') {
    const updatedPerson = await prisma.person.update({ where: { id: submission.personId }, data: { verified: true } });
    await logAudit(user.id, 'verify_person', 'person', submission.personId, `Подтверждена карточка ${submission.person.fullName}`);
    return NextResponse.json({ ok: true, submission, person: updatedPerson });
  }

  const nextStatus = actionMap[action];
  const [updatedSubmission, updatedPerson] = await prisma.$transaction([
    prisma.submission.update({ where: { id: submissionId }, data: { status: nextStatus } }),
    prisma.person.update({ where: { id: submission.personId }, data: { status: nextStatus } })
  ]);

  await logAudit(user.id, `moderation_${action}`, 'submission', submissionId, `${submission.person.fullName} -> ${nextStatus}`);
  return NextResponse.json({ ok: true, submission: updatedSubmission, person: updatedPerson });
}
