import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const persons = await prisma.person.findMany({
    where: { status: 'APPROVED' },
    include: { stories: true, media: true },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json(persons);
}
