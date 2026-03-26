import { NextResponse } from 'next/server';

export function ensureSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!origin || !host) {
    return NextResponse.json({ error: 'Не удалось проверить источник запроса.' }, { status: 403 });
  }

  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    return NextResponse.json({ error: 'Некорректный источник запроса.' }, { status: 403 });
  }

  if (originHost !== host) {
    return NextResponse.json({ error: 'CSRF-защита: источник запроса отклонён.' }, { status: 403 });
  }

  return null;
}
