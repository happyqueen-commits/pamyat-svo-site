import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const SESSION_COOKIE = 'pamyat_session';
const SESSION_DAYS = 14;

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

export async function createSession(userId: string, meta?: { userAgent?: string | null; ipAddress?: string | null }) {
  const token = randomBytes(32).toString('hex');
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      userAgent: meta?.userAgent || null,
      ipAddress: meta?.ipAddress || null
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/'
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } });
  }
  cookieStore.set(SESSION_COOKIE, '', { expires: new Date(0), path: '/' });
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date() || !session.user.isActive) {
    return null;
  }

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() }
  });

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/auth');
  return user;
}

export async function requireRole(roles: readonly string[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect('/cabinet');
  return user;
}

export async function logAudit(userId: string, action: string, entityType: string, entityId?: string, details?: string) {
  await prisma.auditLog.create({
    data: { userId, action, entityType, entityId, details }
  });
}

export function getDefaultRedirect(role: UserRole) {
  if (role === 'ADMIN') return '/cabinet/users';
  if (role === 'MODERATOR') return '/cabinet/moderation';
  return '/cabinet';
}
