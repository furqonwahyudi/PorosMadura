import { Router } from 'express';
import { getCategories, getCategoryArticles, createCategory, updateCategory, deleteCategory } from './category.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:slug/articles', getCategoryArticles);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), createCategory);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), updateCategory);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteCategory);

export default router;
