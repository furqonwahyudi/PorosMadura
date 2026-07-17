import { Router } from 'express';
import { getSummary, getVisitors, getPopular } from './analytics.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.get('/summary', authenticate, getSummary);
router.get('/visitors', authenticate, getVisitors);
router.get('/popular', getPopular);
export default router;
