import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.get('/', getSettings);
router.put('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateSettings);
export default router;
