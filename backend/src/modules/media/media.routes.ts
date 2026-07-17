import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getMedia, uploadMedia, deleteMedia } from './media.controller';
import { authenticate, authorize } from '../../middleware/auth';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/images'),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype);
    cb(null, ok ? true : false);
  },
});

const router = Router();
router.get('/', authenticate, getMedia);
router.post('/upload', authenticate, authorize('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER'), upload.single('file'), uploadMedia);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'ADMIN'), deleteMedia);
export default router;
