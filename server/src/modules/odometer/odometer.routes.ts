import { Router } from 'express';
import { OdometerController } from './odometer.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', OdometerController.getReadings);
router.post('/', OdometerController.addReading);
router.delete('/:id', OdometerController.deleteReading);

export default router;

