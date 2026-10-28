import { Router } from 'express';
import { DocumentsController } from './documents.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', DocumentsController.getAll);
router.post('/', DocumentsController.create);
router.get('/:id', DocumentsController.getById);
router.put('/:id', DocumentsController.update);
router.delete('/:id', DocumentsController.delete);

export default router;

