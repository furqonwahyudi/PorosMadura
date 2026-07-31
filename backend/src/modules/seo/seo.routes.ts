import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import {
  getSeoSettings,
  updateSeoSettings,
  getRedirects,
  createRedirect,
  deleteRedirect,
  getDeadLinks,
  triggerSitemapRebuild
} from './seo.controller';

const router = Router();

// Semua rute di sini memerlukan autentikasi admin/super_admin
router.use(authenticate, authorize('SUPER_ADMIN', 'ADMIN'));

router.route('/settings')
  .get(getSeoSettings)
  .put(updateSeoSettings);

router.route('/redirects')
  .get(getRedirects)
  .post(createRedirect);

router.delete('/redirects/:id', deleteRedirect);

router.get('/dead-links', getDeadLinks);

router.post('/sitemap/rebuild', triggerSitemapRebuild);

export default router;
