import { Router } from 'express';
import { EmergencyController } from './emergency.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/', EmergencyController.getContacts);
router.post('/', EmergencyController.createContact);
router.put('/:id', EmergencyController.updateContact);
router.delete('/:id', EmergencyController.deleteContact);

export default router;

