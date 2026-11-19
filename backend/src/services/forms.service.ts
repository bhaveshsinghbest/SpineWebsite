import { eq } from 'drizzle-orm';
import { db } from '../config/db.ts';
import { env } from '../config/env.ts';
import { enquiries, jobApplications, jobOpenings } from '../models/schema.ts';
import { CV_TYPES } from '../utils/file-signature.ts';
import { badRequest } from '../utils/http-error.ts';
import { sendMail } from '../utils/mailer.ts';
import { storeFile } from './media.service.ts';

interface Meta { ip?: string; userAgent?: string }

export async function createEnquiry(input: { name: string; organisation: string; email: string; phone: string; area: string; message: string }, meta: Meta) {
  const [row] = await db().insert(enquiries).values({
    name: input.name, organisation: input.organisation, email: input.email, phone: input.phone, area: input.area,
    message: input.message || null, ip: meta.ip?.slice(0, 64), userAgent: meta.userAgent?.slice(0, 300),
  }).returning({ id: enquiries.id });
  sendMail({
    to: env.NOTIFY_ENQUIRIES_TO,
    replyTo: input.email,
    subject: `New briefing request — ${input.organisation}`,
    text: [
      `A new enquiry was submitted on the website (reference #${row.id}).`, '',
      `Name: ${input.name}`, `Organisation: ${input.organisation}`, `Email: ${input.email}`, `Phone: ${input.phone}`,
      `Area of interest: ${input.area}`, '', input.message || '(no message)', '',
      `Manage it in the admin panel: ${env.siteUrl}/admin/enquiries/${row.id}`,
    ].join('\n'),
  });
  return row;
}

export async function createApplication(
  input: { name: string; email: string; phone: string; location: string; position: string; qualification: string; experience: number; linkedin: string; message: string },
  file: Express.Multer.File | undefined,
  meta: Meta,
) {
  if (!file) throw badRequest('Please attach your CV.', { cv: ['Please attach your CV.'] });
  const stored = await storeFile(file, { allowed: CV_TYPES, isPublic: false, kind: 'cv' });
  const [job] = await db().select({ id: jobOpenings.id }).from(jobOpenings).where(eq(jobOpenings.title, input.position));
  const [row] = await db().insert(jobApplications).values({
    jobOpeningId: job?.id ?? null, position: input.position, name: input.name, email: input.email, phone: input.phone,
    location: input.location, qualification: input.qualification, experienceYears: String(input.experience),
    linkedin: input.linkedin || null, message: input.message || null, cvMediaId: stored.id, consent: true, ip: meta.ip?.slice(0, 64),
  }).returning({ id: jobApplications.id });
  sendMail({
    to: env.NOTIFY_APPLICATIONS_TO,
    replyTo: input.email,
    subject: `New job application — ${input.position}`,
    text: [
      `A new application was submitted on the website (reference #${row.id}).`, '',
      `Position: ${input.position}`, `Name: ${input.name}`, `Email: ${input.email}`, `Phone: ${input.phone}`,
      `Location: ${input.location}`, `Qualification: ${input.qualification}`, `Experience: ${input.experience} years`, '',
      `The CV is stored securely; download it from the admin panel: ${env.siteUrl}/admin/applications/${row.id}`,
    ].join('\n'),
  });
  return row;
}
