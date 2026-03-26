import { Prisma } from '@prisma/client';

const TRANSIENT_CODES = new Set(['P2021', 'P2022']);

export function isRecoverableDbError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && TRANSIENT_CODES.has(error.code);
}

export async function safeDb<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isRecoverableDbError(error)) {
      return fallback;
    }
    throw error;
  }
}
