import { Router } from 'express';
import {
  getArticles, getArticleBySlug, getBreakingNews,
  getHeadlines, getTrending, getEditorChoice,
  incrementView, incrementRead, incrementShare,
  createArticle, updateArticle, deleteArticle,
  publishArticle, archiveArticle, scrapeArticle,
  getArticleById,
} from './article.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// === PUBLIC ROUTES ===
router.get('/', getArticles);
router.get('/breaking', getBreakingNews);
router.get('/headline', getHeadlines);
router.get('/trending', getTrending);
router.get('/editor-choice', getEditorChoice);
router.get('/:slug', getArticleBySlug);
router.post('/:slug/view', incrementView);
router.post('/:slug/read', incrementRead);
router.post('/:slug/share', incrementShare);

// === ADMIN ROUTES ===
router.get('/detail/:id', authenticate, getArticleById);
router.post('/scrape', authenticate, scrapeArticle);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER'), createArticle);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), updateArticle);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteArticle);
router.patch('/:id/publish', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), publishArticle);
router.patch('/:id/archive', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR'), archiveArticle);

export default router;
