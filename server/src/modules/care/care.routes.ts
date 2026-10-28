import { Router } from 'express';
import { CareController } from './care.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', CareController.getAll);
router.post('/', CareController.create);
router.patch('/:id/complete', CareController.complete);
router.patch('/:id/reschedule', CareController.reschedule);
router.delete('/:id', CareController.delete);

export default router;

