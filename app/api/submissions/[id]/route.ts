import { NextResponse } from 'next/server';
import { PersonRole, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { submissionSchema } from '@/lib/validators';
import { saveSubmissionFiles } from '@/lib/uploads';
import { getCurrentUser, logAudit } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const { id } = await params;
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { person: true }
    });

    if (!submission) {
      return NextResponse.json({ error: 'Материал не найден' }, { status: 404 });
    }

    const elevated = user.role === 'MODERATOR' || user.role === 'ADMIN';
    if (!elevated && submission.userId !== user.id) {
      return NextResponse.json({ error: 'Нет доступа к этому материалу' }, { status: 403 });
    }

    if (submission.status === 'APPROVED' || submission.status === 'ARCHIVED') {
      return NextResponse.json({ error: 'Опубликованный или архивный материал редактировать нельзя' }, { status: 400 });
    }

    const form = await request.formData();
    const payload = {
      fullName: String(form.get('fullName') || ''),
      role: String(form.get('role') || ''),
      biography: String(form.get('biography') || ''),
      city: String(form.get('city') || ''),
      region: String(form.get('region') || ''),
      memoryText: String(form.get('memoryText') || ''),
      heroQuote: String(form.get('heroQuote') || ''),
      submitterName: String(form.get('submitterName') || ''),
      submitterEmail: String(form.get('submitterEmail') || ''),
      submitterPhone: String(form.get('submitterPhone') || ''),
      relation: String(form.get('relation') || ''),
      note: String(form.get('note') || ''),
      website: String(form.get('website') || '')
    };
    const intent = String(form.get('intent') || 'save');

    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Неверные данные' }, { status: 400 });
    }

    const files = form.getAll('files').filter((item): item is File => item instanceof File);
    const savedFiles = await saveSubmissionFiles(files);
    const data = parsed.data;
    const nextStatus = intent === 'resubmit' ? 'PENDING_REVIEW' : submission.status;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.person.update({
        where: { id: submission.personId },
        data: {
          fullName: data.fullName,
          role: data.role as PersonRole,
          biography: data.biography,
          city: data.city || null,
          region: data.region || null,
          memoryText: data.memoryText || null,
          heroQuote: data.heroQuote || null,
          sourceLabel: data.relation || submission.person.sourceLabel || 'Материал от пользователя',
          sourceNote: data.note || null,
          status: nextStatus
        }
      });

      await tx.submission.update({
        where: { id: submission.id },
        data: {
          submitterName: data.submitterName,
          submitterEmail: data.submitterEmail,
          submitterPhone: data.submitterPhone || null,
          relation: data.relation || null,
          note: data.note || null,
          status: nextStatus,
          assets: savedFiles.length ? { create: savedFiles } : undefined
        }
      });

      return tx.submission.findUnique({
        where: { id: submission.id },
        include: { assets: { orderBy: { createdAt: 'desc' } }, person: true }
      });
    });

    await logAudit(
      user.id,
      intent === 'resubmit' ? 'resubmit_submission' : 'update_submission',
      'submission',
      submission.id,
      `${intent === 'resubmit' ? 'Материал передан повторно' : 'Материал обновлён'}: ${data.fullName}`
    );

    return NextResponse.json({ ok: true, submission: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json({ error: 'Не удалось сохранить изменения в базе данных' }, { status: 500 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка сервера' }, { status: 500 });
  }
}
