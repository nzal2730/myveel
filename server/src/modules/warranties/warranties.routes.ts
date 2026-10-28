import { Router } from 'express';
import { WarrantiesController } from './warranties.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', WarrantiesController.getAll);
router.post('/', WarrantiesController.create);
router.get('/:id', WarrantiesController.getById);
router.put('/:id', WarrantiesController.update);
router.delete('/:id', WarrantiesController.delete);

export default router;

