import { pino } from 'pino';
import { env } from '../config/env.ts';

export const logger = pino({
  level: env.isTest ? 'silent' : env.LOG_LEVEL,
  redact: { paths: ['req.headers.cookie', 'req.headers.authorization', 'password', '*.password'], remove: true },
  ...(env.isProd ? {} : { transport: { target: 'pino-pretty', options: { singleLine: true, ignore: 'pid,hostname' } } }),
});
