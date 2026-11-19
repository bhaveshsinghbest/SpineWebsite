import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Validated and coerced request data (see `validate`). */
      valid: { body?: any; query?: any; params?: any };
    }
  }
}

/** Validates (and strips unknown keys from) the request body, query or params with a Zod schema. */
export const validate = (schema: ZodType, where: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.valid ??= {};
    req.valid[where] = schema.parse(where === 'body' ? (req.body ?? {}) : req[where]);
    next();
  };
