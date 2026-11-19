import { Router } from 'express';
import * as c from '../controllers/admin.controller.ts';
import { authenticate, requirePermission } from '../middleware/auth.ts';
import { requireCsrfHeader } from '../middleware/csrf.ts';
import { uploadSingle } from '../middleware/upload.ts';
import { resources } from '../services/resources.ts';

// Every route below requires the administrator's session (authenticate) and, for changes, the CSRF header.
export const adminRouter = Router();
adminRouter.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
adminRouter.use(authenticate, requireCsrfHeader);

adminRouter.get('/dashboard', c.dashboard);

for (const def of resources) {
  const h = c.resourceHandlers(def);
  const p = requirePermission(def.permission);
  adminRouter.get(`/${def.name}`, p, h.list);
  adminRouter.post(`/${def.name}`, p, h.create);
  adminRouter.get(`/${def.name}/:id`, p, h.get);
  adminRouter.put(`/${def.name}/:id`, p, h.update);
  if (def.publication) adminRouter.patch(`/${def.name}/:id/status`, p, h.setStatus);
  adminRouter.delete(`/${def.name}/:id`, p, h.remove);
}

adminRouter.get('/content/:key', requirePermission('content'), c.getContent);
adminRouter.put('/content/:key', requirePermission('content'), c.saveContent);

adminRouter.get('/enquiries', requirePermission('enquiries'), c.listEnquiries);
adminRouter.get('/enquiries/export', requirePermission('enquiries'), c.exportEnquiries);
adminRouter.get('/enquiries/:id', requirePermission('enquiries'), c.getEnquiry);
adminRouter.patch('/enquiries/:id', requirePermission('enquiries'), c.updateEnquiry);
adminRouter.delete('/enquiries/:id', requirePermission('enquiries'), c.deleteEnquiry);

adminRouter.get('/applications', requirePermission('applications'), c.listApplications);
adminRouter.get('/applications/export', requirePermission('applications'), c.exportApplications);
adminRouter.get('/applications/:id', requirePermission('applications'), c.getApplication);
adminRouter.get('/applications/:id/cv', requirePermission('applications'), c.downloadCv);
adminRouter.patch('/applications/:id', requirePermission('applications'), c.updateApplication);
adminRouter.delete('/applications/:id', requirePermission('applications'), c.deleteApplication);

adminRouter.get('/media', requirePermission('media'), c.listMediaFiles);
adminRouter.post('/media', requirePermission('media'), uploadSingle('file', 8), c.uploadMedia);
adminRouter.delete('/media/:id', requirePermission('media'), c.removeMedia);

// The audit log is read-only: there are deliberately no PUT, PATCH or DELETE routes for it.
adminRouter.get('/activity', requirePermission('activity'), c.activity);
