import { Router } from 'express';
import { TyreBatteryController } from './tyreBattery.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', TyreBatteryController.getAll);
router.post('/', TyreBatteryController.create);
router.post('/:id/action', TyreBatteryController.logAction);
router.get('/:id', TyreBatteryController.getById);
router.put('/:id', TyreBatteryController.update);
router.delete('/:id', TyreBatteryController.delete);

export default router;

