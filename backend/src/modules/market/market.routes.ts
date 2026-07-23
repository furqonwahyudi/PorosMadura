import { Router } from 'express';
import { getMarketRates, getMarketSettings, updateMarketSettings } from './market.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public routes
router.get('/rates', getMarketRates);
router.get('/settings', getMarketSettings);

// Protected routes (Admin-only)
router.put('/settings', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateMarketSettings);

export default router;
