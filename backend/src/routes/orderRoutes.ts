import express from 'express';
import {
  createOrder,
  getVendorOrders,
  getDeliveryPartnerOrder,
  assignDeliveryPartner,
  startDelivery,
  trackOrder,
  getAvailableDeliveryPartners
} from '../controllers/orderController';
import { protect, authorize } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/', protect, authorize(['vendor']), createOrder);
router.get('/vendor', protect, authorize(['vendor']), getVendorOrders);
router.put('/:orderId/assign', protect, authorize(['vendor']), assignDeliveryPartner);
router.get('/delivery-partners/available', protect, authorize(['vendor']), getAvailableDeliveryPartners);

router.get('/delivery', protect, authorize(['deliveryPartner']), getDeliveryPartnerOrder);
router.put('/:orderId/start', protect, authorize(['deliveryPartner']), startDelivery);

router.get('/:orderId/track', trackOrder);


export default router;