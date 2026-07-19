import { Router } from 'express';
import { getTags, createTag, updateTag, deleteTag, mergeTags } from './tag.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', getTags);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createTag);
router.post('/merge', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), mergeTags);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateTag);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteTag);

export default router;
