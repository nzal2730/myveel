import { Router } from 'express';
import { LicenceController } from './licence.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', LicenceController.get);
router.post('/', LicenceController.save);
router.delete('/', LicenceController.delete);

export default router;

