import fs from 'node:fs';
import type { Request, Response } from 'express';
import { z } from 'zod';
import * as admin from '../services/admin.service.ts';
import * as crud from '../services/crud.service.ts';
import type { ResourceDef } from '../services/crud.service.ts';
import { deleteMedia, listMedia, privateFile, storeFile } from '../services/media.service.ts';
import { logActivity } from '../services/activity.service.ts';
import { sendCsv, toCsv } from '../utils/csv.ts';
import { DOCUMENT_TYPES, IMAGE_TYPES } from '../utils/file-signature.ts';
import { badRequest } from '../utils/http-error.ts';
import { idParam, isContentKey, isoDate, listQuery } from '../validators/content.ts';

const id = (req: Request) => idParam.parse(req.params).id;
const stamp = () => new Date().toISOString().slice(0, 10);

/** Handlers for a generic resource (see services/resources.ts). */
export const resourceHandlers = (def: ResourceDef) => ({
  list: async (req: Request, res: Response) => { res.json(await crud.list(def, { ...listQuery.parse(req.query), ...extraFilters(def, req) })); },
  get: async (req: Request, res: Response) => { res.json(await crud.get(def, id(req))); },
  create: async (req: Request, res: Response) => { res.status(201).json(await crud.create(def, def.input.parse(req.body ?? {}) as any, req.user?.id)); },
  update: async (req: Request, res: Response) => { res.json(await crud.update(def, id(req), def.input.parse(req.body ?? {}) as any, req.user?.id)); },
  setStatus: async (req: Request, res: Response) => {
    const { status } = z.object({ status: z.string().trim().min(1).max(30) }).parse(req.body ?? {});
    res.json(await crud.setPublication(def, id(req), status, req.user?.id));
  },
  remove: async (req: Request, res: Response) => { await crud.remove(def, id(req), req.user?.id); res.status(204).end(); },
});

/** Resource-specific exact-match filters that are not part of the shared list query (e.g. job department). */
function extraFilters(def: ResourceDef, req: Request) {
  const out: Record<string, string> = {};
  for (const key of Object.keys(def.filters ?? {})) {
    const v = req.query[key];
    if (typeof v === 'string' && v.length <= 120) out[key] = v.trim();
  }
  return out;
}

// ---------- Content blocks ----------
const contentKey = (req: Request) => {
  const key = String(req.params.key);
  if (!isContentKey(key)) throw badRequest('Unknown content section');
  return key;
};
export const getContent = async (req: Request, res: Response) => { res.json(await admin.getContentBlock(contentKey(req))); };
export const saveContent = async (req: Request, res: Response) => {
  res.json(await admin.saveContentBlock(contentKey(req), req.body?.data, req.user!.id));
};

// ---------- Submissions ----------
const notes = z.string().max(4000).optional().nullable();
const enquiryPatch = z.object({
  status: z.enum(['new', 'in_progress', 'resolved', 'closed']), notes,
  followUpOn: isoDate.optional().nullable().or(z.literal('')).transform((v) => v || null),
});
const applicationPatch = z.object({ status: z.enum(['pending', 'shortlisted', 'rejected', 'selected']), notes });

export const listEnquiries = async (req: Request, res: Response) => { res.json(await admin.listEnquiries(listQuery.parse(req.query))); };
export const getEnquiry = async (req: Request, res: Response) => { res.json(await admin.getEnquiry(id(req))); };
export const updateEnquiry = async (req: Request, res: Response) => { res.json(await admin.updateEnquiry(id(req), enquiryPatch.parse(req.body ?? {}), req.user!.id)); };
export const deleteEnquiry = async (req: Request, res: Response) => { await admin.deleteEnquiry(id(req), req.user!.id); res.status(204).end(); };
export async function exportEnquiries(req: Request, res: Response) {
  const rows = await admin.exportEnquiries(listQuery.parse(req.query));
  logActivity(req.user!.id, 'export', 'enquiries', undefined, `${rows.length} enquiries exported to CSV`);
  sendCsv(res, `enquiries-${stamp()}.csv`, toCsv(rows, [
    { header: 'Reference', value: (r) => r.id }, { header: 'Received', value: (r) => r.createdAt }, { header: 'Status', value: (r) => r.status.replace('_', ' ') },
    { header: 'Name', value: (r) => r.name }, { header: 'Organisation', value: (r) => r.organisation }, { header: 'Email', value: (r) => r.email },
    { header: 'Phone', value: (r) => r.phone }, { header: 'Category (area of interest)', value: (r) => r.area }, { header: 'Message', value: (r) => r.message },
    { header: 'Follow-up date', value: (r) => r.followUpOn }, { header: 'Internal remarks', value: (r) => r.notes },
  ]));
}

export const listApplications = async (req: Request, res: Response) => { res.json(await admin.listApplications(listQuery.parse(req.query))); };
export const getApplication = async (req: Request, res: Response) => { res.json(await admin.getApplication(id(req))); };
export const updateApplication = async (req: Request, res: Response) => { res.json(await admin.updateApplication(id(req), applicationPatch.parse(req.body ?? {}), req.user!.id)); };
export const deleteApplication = async (req: Request, res: Response) => {
  // Resolve the CV's file path before its database record is removed.
  const existing = await admin.getApplication(id(req));
  const { file } = await privateFile(existing.cvMediaId);
  await admin.deleteApplication(id(req), req.user!.id);
  await fs.promises.rm(file, { force: true });
  res.status(204).end();
};
export async function exportApplications(req: Request, res: Response) {
  const rows = await admin.exportApplications(listQuery.parse(req.query));
  logActivity(req.user!.id, 'export', 'applications', undefined, `${rows.length} applications exported to CSV`);
  sendCsv(res, `applications-${stamp()}.csv`, toCsv(rows, [
    { header: 'Reference', value: (r) => r.id }, { header: 'Received', value: (r) => r.createdAt }, { header: 'Status', value: (r) => r.status },
    { header: 'Position', value: (r) => r.position }, { header: 'Name', value: (r) => r.name }, { header: 'Email', value: (r) => r.email },
    { header: 'Phone', value: (r) => r.phone }, { header: 'Location', value: (r) => r.location }, { header: 'Qualification', value: (r) => r.qualification },
    { header: 'Experience (years)', value: (r) => r.experienceYears }, { header: 'LinkedIn', value: (r) => r.linkedin }, { header: 'Message', value: (r) => r.message },
    { header: 'Internal remarks', value: (r) => r.notes },
  ]));
}

/** Streams the applicant's CV as a download (never rendered inline). */
export async function downloadCv(req: Request, res: Response) {
  const app = await admin.getApplication(id(req));
  const { row, file } = await privateFile(app.cvMediaId);
  logActivity(req.user!.id, 'download', 'applications', app.id, `CV downloaded — ${app.name}`);
  res.set({ 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.download(file, row.originalName, { headers: { 'Content-Type': row.mimeType } });
}

// ---------- Media ----------
export async function uploadMedia(req: Request, res: Response) {
  if (!req.file) throw badRequest('Choose a file to upload.');
  const kind = z.enum(['image', 'document']).default('image').parse(req.body?.kind);
  const stored = await storeFile(req.file, {
    allowed: kind === 'image' ? IMAGE_TYPES : DOCUMENT_TYPES, isPublic: true, kind, uploadedBy: req.user!.id,
    alt: typeof req.body?.alt === 'string' ? req.body.alt.slice(0, 255) : undefined,
  });
  logActivity(req.user!.id, 'upload', 'media', stored.id, stored.originalName);
  res.status(201).json(stored);
}
export const listMediaFiles = async (req: Request, res: Response) => {
  const q = listQuery.parse(req.query);
  res.json(await listMedia(q));
};
export const removeMedia = async (req: Request, res: Response) => {
  const row = await deleteMedia(id(req));
  logActivity(req.user!.id, 'delete', 'media', row.id, row.originalName);
  res.status(204).end();
};

// ---------- Audit log & dashboard ----------
export const activity = async (req: Request, res: Response) => { res.json(await admin.listActivity(listQuery.parse(req.query))); };
export const dashboard = async (_req: Request, res: Response) => { res.json(await admin.dashboard()); };
