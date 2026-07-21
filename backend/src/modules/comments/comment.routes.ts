import { Router } from 'express';
import {
  getComments, getAllCommentsAdmin, createComment, replyComment,
  approveComment, unapproveComment, deleteComment, getCommentStats,
  getSpamCommentsAdmin, emptySpamStorage, getReportedCommentsAdmin,
  dismissReportComment, getBlacklistWords, createBlacklistWord, deleteBlacklistWord
} from './comment.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Admin routes (must be registered before /:articleSlug)
router.get('/admin/all', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), getAllCommentsAdmin);
router.get('/admin/stats', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), getCommentStats);
router.get('/admin/spam', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), getSpamCommentsAdmin);
router.delete('/admin/spam/empty', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), emptySpamStorage);
router.get('/admin/reports', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), getReportedCommentsAdmin);
router.patch('/admin/reports/:id/dismiss', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), dismissReportComment);

// Blacklist routes
router.get('/admin/blacklist', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), getBlacklistWords);
router.post('/admin/blacklist', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), createBlacklistWord);
router.delete('/admin/blacklist/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteBlacklistWord);

router.post('/admin/:commentId/reply', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), replyComment);

// Single comment actions
router.patch('/:id/approve', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), approveComment);
router.patch('/:id/unapprove', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), unapproveComment);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteComment);

// Public article comments
router.get('/:articleSlug', getComments);
router.post('/:articleSlug', createComment);

export default router;
