import { Router } from 'express';
import { InsuranceController } from './insurance.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', InsuranceController.getAll);
router.post('/', InsuranceController.create);
router.get('/comparison', InsuranceController.getComparison);
router.post('/:id/renew', InsuranceController.renew);
router.get('/:id', InsuranceController.getById);
router.put('/:id', InsuranceController.update);
router.delete('/:id', InsuranceController.delete);

export default router;

