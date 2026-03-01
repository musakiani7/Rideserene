const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentIntent,
  confirmPayment,
  getPaymentDetails,
} = require('../controllers/stripeController');

// All routes require authentication
router.use(protect);

router.post('/create-payment-intent', createPaymentIntent);
router.post('/confirm-payment', confirmPayment);
router.get('/payment/:paymentIntentId', getPaymentDetails);

module.exports = router;
