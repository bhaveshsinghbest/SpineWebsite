import type { ErrorRequestHandler, RequestHandler } from 'express';
import multer from 'multer';
import { ZodError, z } from 'zod';
import { HttpError } from '../utils/http-error.ts';
import { logger } from '../utils/logger.ts';

/** Consistent JSON error responses: { error: { message, details? } }. Internal details are never leaked. */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: 'Please check the highlighted fields.', details: z.flattenError(err).fieldErrors } });
    return;
  }
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, details: err.details } });
    return;
  }
  if (err instanceof multer.MulterError) {
    const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    res.status(status).json({ error: { message: err.code === 'LIMIT_FILE_SIZE' ? 'The file is too large.' : 'The upload could not be processed.' } });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: { message: 'The request is too large.' } });
    return;
  }
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'Malformed JSON body.' } });
    return;
  }
  const pgCode: string | undefined = err?.code ?? err?.cause?.code;
  if (pgCode === '23505') {
    res.status(409).json({ error: { message: 'An item with the same unique value (such as the slug) already exists.' } });
    return;
  }
  if (pgCode === '23503') {
    res.status(409).json({ error: { message: 'This item is linked to other records and cannot be changed that way.' } });
    return;
  }
  if (pgCode === '23514') {
    res.status(400).json({ error: { message: 'The data breaks a content rule (for example, a testimonial cannot be published without client consent).' } });
    return;
  }
  logger.error({ err, url: req.originalUrl, method: req.method }, 'Unhandled error');
  res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { message: 'Not found' } });
};
