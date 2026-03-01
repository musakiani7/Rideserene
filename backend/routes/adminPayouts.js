const express = require('express');
const router = express.Router();
const adminPayoutController = require('../controllers/adminPayoutController');
const { protect } = require('../middleware/adminAuth');

// All routes require admin authentication
router.use(protect);

// Payout management routes
router.get('/stats', adminPayoutController.getPayoutStats);
router.get('/:id', adminPayoutController.getPayoutDetails);
router.get('/', adminPayoutController.getAllPayouts);
router.put('/:id/approve', adminPayoutController.approvePayout);
router.put('/:id/complete', adminPayoutController.completePayout);
router.put('/:id/reject', adminPayoutController.rejectPayout);

module.exports = router;
