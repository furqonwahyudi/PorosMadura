import { Router } from 'express';
import { getAdForSlot, recordImpression, recordClick, getAdSlots, createAd, updateAd, deleteAd } from './ad.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Public
router.get('/slot/:slug', getAdForSlot);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// Admin
router.get('/slots', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAdSlots);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createAd);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateAd);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteAd);

export default router;
