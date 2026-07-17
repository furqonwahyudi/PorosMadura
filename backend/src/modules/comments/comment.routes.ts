import { Router } from 'express';
import { getComments, createComment, approveComment, deleteComment } from './comment.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.get('/:articleSlug', getComments);
router.post('/:articleSlug', createComment);
router.patch('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), approveComment);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteComment);
export default router;
