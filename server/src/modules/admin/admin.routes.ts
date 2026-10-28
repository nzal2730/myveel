import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { AdminController } from './admin.controller';

const router = Router();

router.use(authenticate as any);
router.use(requireAdmin as any);

router.get('/overview', AdminController.getOverview);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/role', AdminController.updateUserRole);
router.patch('/users/:id/verification', AdminController.updateUserVerification);
router.delete('/users/:id', AdminController.deleteUser);
router.get('/vehicles', AdminController.getVehicles);
router.delete('/vehicles/:id', AdminController.deleteVehicle);

export default router;
