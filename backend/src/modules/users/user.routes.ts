import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();
router.get('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), getUsers);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createUser);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateUser);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), deleteUser);
export default router;
