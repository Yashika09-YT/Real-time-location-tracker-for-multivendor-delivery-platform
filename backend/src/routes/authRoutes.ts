import express from 'express';
import { 
    vendorSignup, vendorLogin, 
    deliveryPartnerSignup, deliveryPartnerLogin, getMe 
} from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/vendor/signup', vendorSignup);
router.post('/vendor/login', vendorLogin);
router.post('/delivery/signup', deliveryPartnerSignup);
router.post('/delivery/login', deliveryPartnerLogin);

router.get('/me', protect, getMe); 
export default router;