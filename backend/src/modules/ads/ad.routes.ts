import { Router } from 'express';
import {
  getAdForSlot, recordImpression, recordClick,
  getAdSlots, createAdSlot, updateAdSlot, deleteAdSlot,
  createAd, updateAd, deleteAd,
  getAds, getAdvertisers, createAdvertiser,
  updateAdvertiser, deleteAdvertiser, getCampaigns,
  createCampaign, updateCampaign, deleteCampaign,
  getPublicAdSlots, getActiveAds
} from './ad.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// === PUBLIC ROUTES ===
router.get('/slot/:slug', getAdForSlot);
router.get('/slots/public', getPublicAdSlots);
router.get('/active', getActiveAds);
router.post('/:id/impression', recordImpression);
router.post('/:id/click', recordClick);

// === ADMIN ROUTES ===

// Ads CRUD
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAds);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createAd);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateAd);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteAd);

// Slots CRUD
router.get('/slots', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAdSlots);
router.post('/slots', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createAdSlot);
router.put('/slots/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateAdSlot);
router.delete('/slots/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteAdSlot);

// Advertisers CRUD
router.get('/advertisers', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getAdvertisers);
router.post('/advertisers', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createAdvertiser);
router.put('/advertisers/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateAdvertiser);
router.delete('/advertisers/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteAdvertiser);

// Campaigns CRUD
router.get('/campaigns', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getCampaigns);
router.post('/campaigns', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createCampaign);
router.put('/campaigns/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateCampaign);
router.delete('/campaigns/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteCampaign);

export default router;
