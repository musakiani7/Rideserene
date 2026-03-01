const express = require('express');
const router = express.Router();
const {
  getOverview,
  getTodayRides,
  getRideRequests,
  getUpcomingRides,
  getCompletedRides,
  getRideHistory,
  getEarnings,
  updateOnlineStatus,
  getVehicleInfo,
  getRatings,
  updateRideStatus,
  approveRide,
  declineRide,
  startRide,
  completeRide,
  cancelRide,
  getRideDetails,
  getRideStats,
  requestPayout,
  getPayouts,
  getPayoutDetails,
  cancelPayout,
  getAvailableBalance,
  updateAvailability,
  getAvailability,
} = require('../controllers/chauffeurDashboardController');
const { protect } = require('../controllers/chauffeurController');
const {
  getChatEligibleRidesChauffeur,
  getConversationsChauffeur,
  getOrCreateConversationByBookingChauffeur,
  getMessagesChauffeur,
  sendMessageChauffeur,
  deleteConversationChauffeur,
} = require('../controllers/chatController');
const { chatImageUpload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Dashboard routes
router.get('/overview', getOverview);
router.get('/today-rides', getTodayRides);
router.get('/rides/requests', getRideRequests);
router.get('/rides/upcoming', getUpcomingRides);
router.get('/rides/completed', getCompletedRides);
router.get('/rides/history', getRideHistory);
router.get('/earnings', getEarnings);
router.put('/online-status', updateOnlineStatus);
router.get('/vehicle', getVehicleInfo);
router.get('/ratings', getRatings);
router.get('/ride-stats', getRideStats);

// Ride management routes
router.get('/rides/:id', getRideDetails);
router.put('/rides/:id/status', updateRideStatus);
router.put('/rides/:id/approve', approveRide);
router.put('/rides/:id/decline', declineRide);
router.put('/rides/:id/start', startRide);
router.put('/rides/:id/complete', completeRide);
router.put('/rides/:id/cancel', cancelRide);

// Payout routes
router.post('/payouts/request', requestPayout);
router.get('/payouts/available-balance', getAvailableBalance);
router.get('/payouts/:id', getPayoutDetails);
router.get('/payouts', getPayouts);
router.put('/payouts/:id/cancel', cancelPayout);

// Availability routes
router.get('/availability', getAvailability);
router.put('/availability', updateAvailability);

// Chat (chauffeur <-> customer, once ride assigned)
router.get('/chat/rides', getChatEligibleRidesChauffeur);
router.get('/chat/conversations', getConversationsChauffeur);
router.delete('/chat/conversations/:bookingId', deleteConversationChauffeur); // DELETE before GET to avoid conflicts
router.get('/chat/conversations/:bookingId', getOrCreateConversationByBookingChauffeur);
router.get('/chat/conversations/:bookingId/messages', getMessagesChauffeur);
router.post('/chat/conversations/:bookingId/messages', 
  (req, res, next) => {
    chatImageUpload.single('image')(req, res, (err) => {
      if (err) {
        console.error('Multer upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
        });
      }
      next();
    });
  },
  sendMessageChauffeur
);

module.exports = router;