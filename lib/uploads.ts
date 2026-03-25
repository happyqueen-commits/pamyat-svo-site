import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { MediaType } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9а-яё._-]+/gi, '-').replace(/-+/g, '-');
}

export function detectMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'PHOTO';
  if (file.type.startsWith('audio/')) return 'AUDIO';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

export async function saveSubmissionFiles(files: File[]) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions');
  await mkdir(uploadDir, { recursive: true });

  const saved = [];
  for (const file of files) {
    if (!file.size) continue;
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`Файл ${file.name} превышает 10 МБ`);
    }

    const ext = path.extname(file.name) || '';
    const base = sanitizeFileName(path.basename(file.name, ext));
    const finalName = `${Date.now()}-${randomUUID()}-${base}${ext}`;
    const finalPath = path.join(uploadDir, finalName);
    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(finalPath, bytes);

        saved.push({
      url: `/uploads/submissions/${finalName}`,
      originalName: file.name,
      sizeBytes: file.size,
      type: detectMediaType(file)
    });
  }

  return saved;
}
