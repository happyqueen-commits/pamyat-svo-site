import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { submissionSchema } from '@/lib/validators';
import { saveSubmissionFiles } from '@/lib/uploads';
import { PersonRole } from '@prisma/client';
import { getCurrentUser, logAudit } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const limiter = rateLimit(`submission:${ip}`, 8, 60 * 60 * 1000);
    if (!limiter.ok) {
      return NextResponse.json({ error: 'Слишком много отправок. Повторите позже.' }, { status: 429 });
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

    const parsed = submissionSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Неверные данные' }, { status: 400 });
    }

    if (parsed.data.website) {
      return NextResponse.json({ error: 'Отправка отклонена системой защиты.' }, { status: 400 });
    }

    const user = await getCurrentUser();
    const files = form.getAll('files').filter((item): item is File => item instanceof File);
    const savedFiles = await saveSubmissionFiles(files);
    const data = parsed.data;

    const created = await prisma.person.create({
      data: {
        fullName: data.fullName,
        role: data.role as PersonRole,
        biography: data.biography,
        city: data.city || null,
        region: data.region || null,
        memoryText: data.memoryText || null,
        heroQuote: data.heroQuote || null,
        sourceType: 'PERSONAL',
        sourceLabel: data.relation || 'Материал от пользователя',
        sourceNote: data.note || null,
        status: 'PENDING_REVIEW',
        submissions: {
          create: {
            submitterName: data.submitterName,
            submitterEmail: data.submitterEmail,
            submitterPhone: data.submitterPhone || null,
            relation: data.relation || null,
            note: data.note || null,
            status: 'PENDING_REVIEW',
            userId: user?.id,
            assets: { create: savedFiles }
          }
        }
      },
      include: { submissions: { include: { assets: true } } }
    });

    if (user) {
      await logAudit(user.id, 'create_submission', 'submission', created.submissions[0]?.id, `Отправлен материал: ${created.fullName}`);
    }

    return NextResponse.json({ ok: true, id: created.id, files: created.submissions[0]?.assets.length || 0 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Ошибка сервера' }, { status: 500 });
  }
}
