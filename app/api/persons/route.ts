import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { safeDb } from '@/lib/db-safe';

export async function GET() {
  const persons = await safeDb(() => prisma.person.findMany({
    where: { status: 'APPROVED' },
    include: { stories: true, media: true },
    orderBy: { createdAt: 'desc' }
  }), []);

  return NextResponse.json(persons);
}
