import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middlewares/auth/auth-middleware';
import { requirePlanFeature } from '../middlewares/auth/plan-middleware';
import { validateId } from '../middlewares/validation/validate';
import { PrismaClientPhotoRepository } from '../infrastructure/db/prisma-client-photo-repository';
import { UploadClientPhotoUseCase } from '../application/use-cases/client-photo/upload-client-photo-use-case';
import { ListClientPhotosUseCase } from '../application/use-cases/client-photo/list-client-photos-use-case';
import { DeleteClientPhotoUseCase } from '../application/use-cases/client-photo/delete-client-photo-use-case';
import { UpdateClientPhotoUseCase } from '../application/use-cases/client-photo/update-client-photo-use-case';
import { ClientPhotoController } from '../adapters/controllers/client-photo-controller';
import { getStorageService } from '../infrastructure/storage/storage-factory';

const router = Router({ mergeParams: true });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB before processing
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|heic|heif/;
    const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const okMime = file.mimetype.startsWith('image/');
    if (okExt || okMime) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas.'));
    }
  },
});

const repo = new PrismaClientPhotoRepository();
const storage = getStorageService();
const uploadUseCase = new UploadClientPhotoUseCase(repo, storage);
const listUseCase = new ListClientPhotosUseCase(repo, storage);
const deleteUseCase = new DeleteClientPhotoUseCase(repo, storage);
const updateUseCase = new UpdateClientPhotoUseCase(repo);
const controller = new ClientPhotoController(
  uploadUseCase,
  listUseCase,
  deleteUseCase,
  updateUseCase,
);

router.use(authMiddleware);
router.use(requirePlanFeature('photos'));

router.post('/', upload.single('photo'), (req, res, next) =>
  controller.upload(req, res, next),
);
router.get('/', (req, res, next) => controller.list(req, res, next));
router.patch('/:id', validateId, (req, res, next) => controller.update(req, res, next));
router.delete('/:id', validateId, (req, res, next) => controller.delete(req, res, next));

export default router;
