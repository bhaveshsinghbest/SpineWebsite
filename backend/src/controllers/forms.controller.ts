import type { Request, Response } from 'express';
import { createApplication, createEnquiry } from '../services/forms.service.ts';
import { applicationInput, enquiryInput, isLikelySpam } from '../validators/forms.ts';

const meta = (req: Request) => ({ ip: req.ip, userAgent: req.get('user-agent') });

export async function submitEnquiry(req: Request, res: Response) {
  const input = enquiryInput.parse(req.body ?? {});
  // Spam is acknowledged like a normal submission but never stored.
  if (isLikelySpam(input, 3000)) return void res.status(201).json({ ok: true });
  const row = await createEnquiry(input, meta(req));
  res.status(201).json({ ok: true, reference: row.id });
}

export async function submitApplication(req: Request, res: Response) {
  const input = applicationInput.parse(req.body ?? {});
  if (isLikelySpam(input, 4000)) return void res.status(201).json({ ok: true });
  const row = await createApplication(input, req.file, meta(req));
  res.status(201).json({ ok: true, reference: row.id });
}
