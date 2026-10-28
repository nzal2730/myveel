import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', SettingsController.getSettings);
router.put('/profile', SettingsController.updateProfile);
router.put('/password', SettingsController.changePassword);
router.put('/preferences', SettingsController.updatePreferences);

export default router;

