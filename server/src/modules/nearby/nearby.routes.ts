import { Router } from 'express';
import { NearbyController } from './nearby.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate as any);

router.get('/search', NearbyController.search);
router.get('/favourites', NearbyController.getFavourites);
router.post('/favourites', NearbyController.addFavourite);
router.delete('/favourites/:id', NearbyController.removeFavourite);

export default router;

