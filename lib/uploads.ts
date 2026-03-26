import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { MediaType } from '@prisma/client';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp3', '.wav', '.ogg', '.mp4', '.webm']);
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'video/mp4',
  'video/webm'
]);

function sanitizeFileName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9а-яё._-]+/gi, '-').replace(/-+/g, '-');
}

export function detectMediaType(file: File): MediaType {
  if (file.type.startsWith('image/')) return 'PHOTO';
  if (file.type.startsWith('audio/')) return 'AUDIO';
  if (file.type.startsWith('video/')) return 'VIDEO';
  return 'DOCUMENT';
}

function hasMagicSignature(bytes: Buffer, ext: string) {
  if (ext === '.png') return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === '.jpg' || ext === '.jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8;
  if (ext === '.webp') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP';
  if (ext === '.pdf') return bytes.subarray(0, 4).toString() === '%PDF';
  if (ext === '.mp3') return bytes.subarray(0, 3).toString() === 'ID3' || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
  if (ext === '.wav') return bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WAVE';
  if (ext === '.ogg') return bytes.subarray(0, 4).toString() === 'OggS';
  if (ext === '.mp4') return bytes.subarray(4, 8).toString() === 'ftyp';
  if (ext === '.webm') return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return false;
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

    const ext = (path.extname(file.name) || '').toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      throw new Error(`Формат файла ${file.name} не поддерживается`);
    }
    if (!ALLOWED_MIME.has(file.type)) {
      throw new Error(`MIME-тип файла ${file.name} не поддерживается`);
    }

    const base = sanitizeFileName(path.basename(file.name, ext));
    const finalName = `${Date.now()}-${randomUUID()}-${base}${ext}`;
    const finalPath = path.join(uploadDir, finalName);
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!hasMagicSignature(bytes, ext)) {
      throw new Error(`Содержимое файла ${file.name} не соответствует расширению`);
    }
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
