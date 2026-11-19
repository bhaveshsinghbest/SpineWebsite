// Outgoing email (form notifications). Without SMTP settings, messages are written to the log instead,
// so forms keep working in development.
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.ts';
import { logger } from './logger.ts';

let transporter: Transporter | null = null;
if (env.SMTP_HOST) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
}

export interface Mail { to: string; subject: string; text: string; replyTo?: string }

/** Sends without blocking the request; failures are logged, never shown to the visitor. */
export function sendMail(mail: Mail): void {
  if (!transporter) {
    logger.info({ to: mail.to, subject: mail.subject }, 'Email not sent (SMTP not configured)');
    return;
  }
  transporter
    .sendMail({ from: env.MAIL_FROM, ...mail })
    .then(() => logger.info({ to: mail.to, subject: mail.subject }, 'Email sent'))
    .catch((err) => logger.error({ err, subject: mail.subject }, 'Email failed'));
}
