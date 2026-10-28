import { Router } from 'express';
import { SeedController } from './seed.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.post('/sample-garage', SeedController.seed);
router.post('/clear-garage', SeedController.clear);

export default router;

