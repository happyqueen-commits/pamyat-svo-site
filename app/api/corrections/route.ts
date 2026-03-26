import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { correctionSchema } from '@/lib/validators';
import { ensureSameOrigin } from '@/lib/csrf';

export async function POST(request: Request) {
  try {
    const csrfError = ensureSameOrigin(request);
    if (csrfError) return csrfError;

    const payload = await request.json();
    const parsed = correctionSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Неверные данные' }, { status: 400 });
    }

    const data = parsed.data;
    const person = await prisma.person.findUnique({ where: { id: data.personId }, select: { id: true, status: true } });

    if (!person || person.status !== 'APPROVED') {
      return NextResponse.json({ error: 'Карточка недоступна для уточнения' }, { status: 404 });
    }

    const created = await prisma.correctionRequest.create({ data });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
