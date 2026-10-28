import { Router } from 'express';
import { VehiclesController } from './vehicles.controller';
import { authenticate } from '../../middleware/auth';
import { upload } from '../../middleware/upload';

const router = Router();

router.use(authenticate as any);

router.get('/', VehiclesController.getAll);
router.post('/', VehiclesController.create);
router.post('/upload-photo', upload.single('photo'), VehiclesController.uploadPhoto);
router.get('/:id', VehiclesController.getById);
router.put('/:id', VehiclesController.update);
router.delete('/:id', VehiclesController.delete);

export default router;

