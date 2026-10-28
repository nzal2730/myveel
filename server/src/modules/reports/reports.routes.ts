import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/vehicle/:vehicleId', ReportsController.generateReport);

export default router;

