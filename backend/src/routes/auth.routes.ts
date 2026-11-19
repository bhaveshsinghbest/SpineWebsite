import { Router } from 'express';
import * as c from '../controllers/auth.controller.ts';
import { authenticate } from '../middleware/auth.ts';
import { requireCsrfHeader } from '../middleware/csrf.ts';
import { loginLimiter, resetLimiter } from '../middleware/rate-limit.ts';

export const authRouter = Router();
authRouter.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
authRouter.use(requireCsrfHeader);
authRouter.post('/login', loginLimiter, c.login);
authRouter.post('/logout', c.logout);
authRouter.get('/me', authenticate, c.me);
authRouter.post('/change-password', authenticate, loginLimiter, c.changePassword);
authRouter.post('/forgot-password', resetLimiter, c.forgotPassword);
authRouter.get('/reset-password', resetLimiter, c.checkResetToken);
authRouter.post('/reset-password', resetLimiter, c.resetPassword);
