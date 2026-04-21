import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { validateId } from '../middlewares/validation/validate';
import { PrismaClientPhotoRepository } from '../infrastructure/db/prisma-client-photo-repository';
import { UploadClientPhotoUseCase } from '../application/use-cases/client-photo/upload-client-photo-use-case';
import { ListClientPhotosUseCase } from '../application/use-cases/client-photo/list-client-photos-use-case';
import { DeleteClientPhotoUseCase } from '../application/use-cases/client-photo/delete-client-photo-use-case';
import { ClientPhotoController } from '../adapters/controllers/client-photo-controller';

const router = Router({ mergeParams: true });

// ── Multer storage ───────────────────────────────────────────
const uploadDir = path.join(process.cwd(), 'uploads', 'client-photos');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Apenas imagens são permitidas.'));
  },
});

// ── DI ──────────────────────────────────────────────────────
const repo = new PrismaClientPhotoRepository();
const uploadUseCase = new UploadClientPhotoUseCase(repo);
const listUseCase = new ListClientPhotosUseCase(repo);
const deleteUseCase = new DeleteClientPhotoUseCase(repo);
const controller = new ClientPhotoController(uploadUseCase, listUseCase, deleteUseCase);

router.use(authMiddleware);

router.post('/', upload.single('photo'), (req, res, next) => controller.upload(req, res, next));
router.get('/', (req, res, next) => controller.list(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
