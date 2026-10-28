import { Router } from 'express';
import { ServicesController } from './services.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', ServicesController.getAll);
router.post('/', ServicesController.create);
router.get('/reminders', ServicesController.getReminders);
router.patch('/reminders/:id/complete', ServicesController.completeReminder);
router.get('/:id', ServicesController.getById);
router.put('/:id', ServicesController.update);
router.delete('/:id', ServicesController.delete);

export default router;

