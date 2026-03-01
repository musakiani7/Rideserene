const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/adminAuth');

// Import controllers
const { getOverview } = require('../controllers/adminDashboardController');
const bookingController = require('../controllers/adminBookingController');
const customerController = require('../controllers/adminCustomerController');
const chauffeurController = require('../controllers/adminChauffeurController');
const promoController = require('../controllers/adminPromoController');
const supportController = require('../controllers/adminSupportController');
const financeController = require('../controllers/adminFinanceController');

// Dashboard overview
router.get('/overview', protect, getOverview);

// Booking routes (specific routes MUST come before parameterized routes)
router.get('/bookings/stats', protect, bookingController.getBookingStats);
router.put('/bookings/bulk-status', protect, bookingController.bulkUpdateStatus);
router.get('/bookings', protect, bookingController.getAllBookings);
router.get('/bookings/:id', protect, bookingController.getBookingById);
router.put('/bookings/:id', protect, bookingController.updateBooking);
router.put('/bookings/:id/status', protect, bookingController.updateBookingStatus);
router.put('/bookings/:id/assign', protect, bookingController.assignChauffeur);
router.delete('/bookings/:id', protect, bookingController.cancelBooking);

// Customer routes
router.get('/customers', protect, customerController.getAllCustomers);
router.get('/customers/:id', protect, customerController.getCustomerById);
router.put('/customers/:id', protect, customerController.updateCustomer);
router.put('/customers/:id/block', protect, customerController.blockCustomer);
router.put('/customers/:id/unblock', protect, customerController.unblockCustomer);
router.delete('/customers/:id', protect, customerController.deleteCustomer);

// Chauffeur routes
router.get('/chauffeurs', protect, chauffeurController.getAllChauffeurs);
router.get('/chauffeurs/:id', protect, chauffeurController.getChauffeurById);
router.put('/chauffeurs/:id/approve', protect, chauffeurController.approveChauffeur);
router.put('/chauffeurs/:id/reject', protect, chauffeurController.rejectChauffeur);
router.put('/chauffeurs/:id', protect, chauffeurController.updateChauffeur);
router.delete('/chauffeurs/:id', protect, chauffeurController.deleteChauffeur);

// Promo code routes
router.get('/promos', protect, promoController.getAllPromoCodes);
router.post('/promos', protect, promoController.createPromoCode);
router.put('/promos/:id', protect, promoController.updatePromoCode);
router.delete('/promos/:id', protect, promoController.deletePromoCode);

// Support ticket routes
router.get('/support/tickets', protect, supportController.getAllTickets);
router.get('/support/tickets/:id', protect, supportController.getTicketById);
router.put('/support/tickets/:id/status', protect, supportController.updateTicketStatus);
router.put('/support/tickets/:id/assign', protect, supportController.assignTicket);
router.post('/support/tickets/:id/messages', protect, supportController.addMessage);

// Refund routes
router.get('/support/refunds', protect, supportController.getAllRefunds);
router.get('/support/refunds/:id', protect, supportController.getRefundById);
router.put('/support/refunds/:id/approve', protect, supportController.approveRefund);
router.put('/support/refunds/:id/reject', protect, supportController.rejectRefund);
router.put('/support/refunds/:id/process', protect, supportController.processRefund);

// Finance & Payouts routes
// Transaction routes
router.get('/finance/transactions', protect, financeController.getAllTransactions);
router.get('/finance/transactions/export', protect, financeController.exportTransactions);
router.get('/finance/transactions/:id', protect, financeController.getTransactionById);

// Analytics routes
router.get('/finance/analytics', protect, financeController.getRevenueAnalytics);
router.get('/finance/commission-reports', protect, financeController.getCommissionReports);

// Payout routes
router.get('/finance/payouts', protect, financeController.getAllPayouts);
router.get('/finance/payouts/:id', protect, financeController.getPayoutById);
router.put('/finance/payouts/:id/approve', protect, financeController.approvePayout);
router.put('/finance/payouts/:id/process', protect, financeController.processPayout);

module.exports = router;
