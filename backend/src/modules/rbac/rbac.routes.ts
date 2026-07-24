import { Router } from 'express';
import { getRoles, createRole, updateRole, deleteRole, saveMatrix } from './rbac.controller';
import { authenticate, authorizePermission } from '../../middleware/auth';

const router = Router();

// Protect all RBAC routes with settings management permissions
router.get('/', authenticate, authorizePermission('manage_settings'), getRoles);
router.post('/', authenticate, authorizePermission('manage_settings'), createRole);
router.put('/:id', authenticate, authorizePermission('manage_settings'), updateRole);
router.delete('/:id', authenticate, authorizePermission('manage_settings'), deleteRole);
router.post('/matrix', authenticate, authorizePermission('manage_settings'), saveMatrix);

export default router;
