import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', NotificationsController.getAll);
router.post('/sync', NotificationsController.sync);
router.patch('/read-all', NotificationsController.markAllRead);
router.patch('/:id/read', NotificationsController.markRead);
router.delete('/:id', NotificationsController.dismiss);

export default router;

