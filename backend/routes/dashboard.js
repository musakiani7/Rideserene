const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardOverview,
  getUpcomingRides,
  getRideHistory,
  getRideDetails,
  getChauffeurDetailsForRide,
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  getFavoriteLocations,
  addFavoriteLocation,
  updateFavoriteLocation,
  deleteFavoriteLocation,
  getAvailablePromoCodes,
  validatePromoCode,
  updateProfile,
  changePassword,
  addMoneyToWallet,
  getWalletTransactions,
  getWalletBalance,
  getRefunds,
  getEligibleRefundBookings,
  requestRefund,
  getRideReview,
  addOrUpdateRideReview,
  getInvoices,
  createSupportTicket,
  getMySupportTickets,
  getSupportTicketById,
  addSupportTicketMessage,
  getFaq,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/dashboardController');
const {
  getConversationsCustomer,
  getOrCreateConversationByBookingCustomer,
  getMessagesCustomer,
  sendMessageCustomer,
  deleteConversationCustomer,
} = require('../controllers/chatController');
const { chatImageUpload } = require('../middleware/upload');

// All routes require authentication
router.use(protect);

// Dashboard overview
router.get('/overview', getDashboardOverview);

// Rides
router.get('/upcoming-rides', getUpcomingRides);
router.get('/ride-history', getRideHistory);
router.get('/ride/:id/chauffeur-details', getChauffeurDetailsForRide);
router.get('/ride/:id', getRideDetails);
router.get('/invoices', getInvoices);

// Payment methods
router.get('/payment-methods', getPaymentMethods);
router.post('/payment-methods', addPaymentMethod);
router.delete('/payment-methods/:id', deletePaymentMethod);

// Favorite locations (saved addresses: Home, Office, Airport)
router.get('/favorite-locations', getFavoriteLocations);
router.post('/favorite-locations', addFavoriteLocation);
router.put('/favorite-locations/:id', updateFavoriteLocation);
router.delete('/favorite-locations/:id', deleteFavoriteLocation);

// Promo codes
router.get('/promo-codes', getAvailablePromoCodes);
router.post('/validate-promo', validatePromoCode);

// Wallet
router.post('/wallet/add-money', addMoneyToWallet);
router.get('/wallet/transactions', getWalletTransactions);
router.get('/wallet/balance', getWalletBalance);

// Profile
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);

// Refunds
router.get('/refunds', getRefunds);
router.get('/eligible-refund-bookings', getEligibleRefundBookings);
router.post('/request-refund', requestRefund);

// Reviews from customer side
router.get('/rides/:id/review', getRideReview);
router.post('/rides/:id/review', addOrUpdateRideReview);

// Support (Contact Support Form)
router.get('/support', getMySupportTickets);
router.post('/support', createSupportTicket);
router.get('/support/:id', getSupportTicketById);
router.post('/support/:id/messages', addSupportTicketMessage);

// FAQ (Booking Help)
router.get('/faq', getFaq);

// Notifications (in-app)
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

// Chat (customer <-> chauffeur, once ride confirmed)
router.get('/chat/conversations', getConversationsCustomer);
router.delete('/chat/conversations/:bookingId', deleteConversationCustomer); // DELETE before GET to avoid conflicts
router.get('/chat/conversations/:bookingId', getOrCreateConversationByBookingCustomer);
router.get('/chat/conversations/:bookingId/messages', getMessagesCustomer);
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
  sendMessageCustomer
);

module.exports = router;
