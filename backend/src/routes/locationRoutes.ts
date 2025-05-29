import express from 'express';
import { updateLocationApi, getCurrentLocation } from '../controllers/locationController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/update', protect, authorize(['deliveryPartner']), updateLocationApi);

router.get('/order/:orderId', getCurrentLocation);

export default router;