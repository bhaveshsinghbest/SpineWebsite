// File storage. Files are identified by content, renamed to random names, and images are re-encoded
// (which strips metadata and any embedded payloads). CVs are stored outside the public folder.
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { and, count, desc, eq, ilike, or, type SQL } from 'drizzle-orm';
import { escapeLike, sortOrder } from './crud.service.ts';
import { db } from '../config/db.ts';
import { env } from '../config/env.ts';
import { media } from '../models/schema.ts';
import { detectFileType } from '../utils/file-signature.ts';
import { badRequest, notFound } from '../utils/http-error.ts';

export interface StoreOptions { allowed: Set<string>; isPublic: boolean; kind: 'image' | 'document' | 'cv'; uploadedBy?: number; alt?: string }

const safeOriginal = (name: string) => path.basename(name).replace(/[^\w.\- ()]/g, '_').slice(0, 200) || 'file';

export async function storeFile(file: Express.Multer.File, opts: StoreOptions) {
  const type = detectFileType(file.buffer);
  if (!type || !opts.allowed.has(type.ext)) {
    throw badRequest(`Unsupported file. Allowed types: ${[...opts.allowed].join(', ').toUpperCase()}.`);
  }
  let buffer = file.buffer;
  let ext = type.ext;
  let mime = type.mime;
  if (type.kind === 'image') {
    try {
      buffer = await sharp(file.buffer, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer();
    } catch {
      throw badRequest('The image could not be read. Please upload a valid JPG, PNG or WebP file.');
    }
    ext = 'webp';
    mime = 'image/webp';
  }
  const storedName = `${randomUUID()}.${ext}`;
  const dir = opts.isPublic ? env.publicUploadDir : env.privateUploadDir;
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, storedName), buffer, { flag: 'wx' });
  const [row] = await db().insert(media).values({
    kind: opts.kind, originalName: safeOriginal(file.originalname), storedName, mimeType: mime, sizeBytes: buffer.length,
    isPublic: opts.isPublic, alt: opts.alt ?? null, uploadedBy: opts.uploadedBy ?? null,
  }).returning();
  return { ...row, url: opts.isPublic ? `/uploads/${storedName}` : null };
}

/** Public files (images and documents) with search, type filter and pagination. CVs are never listed. */
export async function listMedia(q: { page: number; pageSize: number; q?: string; kind?: string; sort?: string; dir?: string }) {
  const where = [eq(media.isPublic, true)];
  if (q.kind === 'image' || q.kind === 'document') where.push(eq(media.kind, q.kind));
  if (q.q) where.push(or(ilike(media.originalName, escapeLike(q.q)), ilike(media.alt, escapeLike(q.q)))!);
  const cond = and(...where);
  const [{ total }] = await db().select({ total: count() }).from(media).where(cond);
  const rows = await db().select().from(media).where(cond)
    .orderBy(...(sortOrder({ createdAt: media.createdAt, originalName: media.originalName, sizeBytes: media.sizeBytes }, q.sort, q.dir, [desc(media.createdAt), desc(media.id)]) as [SQL]))
    .limit(q.pageSize).offset((q.page - 1) * q.pageSize);
  return {
    data: rows.map((r) => ({ ...r, url: `/uploads/${r.storedName}` })),
    meta: { page: q.page, pageSize: q.pageSize, total, pages: Math.max(1, Math.ceil(total / q.pageSize)) },
  };
}

export async function deleteMedia(id: number) {
  const [row] = await db().select().from(media).where(eq(media.id, id));
  if (!row || !row.isPublic) throw notFound('File');
  await db().delete(media).where(eq(media.id, id));
  await fs.rm(path.join(env.publicUploadDir, row.storedName), { force: true });
  return row;
}

export async function privateFile(id: number) {
  const [row] = await db().select().from(media).where(eq(media.id, id));
  if (!row) throw notFound('File');
  const file = path.join(row.isPublic ? env.publicUploadDir : env.privateUploadDir, row.storedName);
  return { row, file };
}
