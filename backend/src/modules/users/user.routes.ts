import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, updateMe, getSessions, revokeSession, revokeAllSessions, getSecurityActivity } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER'), getUsers);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createUser);
router.put('/me', authenticate, updateMe);

// Sesi dan Aktivitas Keamanan
router.get('/me/sessions', authenticate, getSessions);
router.delete('/me/sessions/:id', authenticate, revokeSession);
router.delete('/me/sessions', authenticate, revokeAllSessions);
router.get('/me/activity', authenticate, getSecurityActivity);

router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteUser);
export default router;
