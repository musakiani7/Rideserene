const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const {
  createBooking,
  getBooking,
  getMyBookings,
  updateBooking,
  updatePaymentStatus,
  cancelBooking,
  searchAvailableChauffeurs,
  validatePromoCode,
  applyPromoCode,
  rebookBooking,
} = require('../controllers/bookingController');

// Validation rules
const bookingValidation = [
  body('rideType').isIn(['one-way', 'by-hour', 'round-trip', 'hourly', 'city-to-city', 'airport-transfer']).withMessage('Invalid ride type'),
  body('pickupLocation.address').notEmpty().withMessage('Pickup location is required'),
  body('pickupDate').notEmpty().withMessage('Valid pickup date is required'),
  body('pickupTime').notEmpty().withMessage('Pickup time is required'),
  body('vehicleClass.name').notEmpty().withMessage('Vehicle class name is required'),
  body('passengerInfo.firstName').notEmpty().withMessage('Passenger first name is required'),
  body('passengerInfo.lastName').notEmpty().withMessage('Passenger last name is required'),
  body('passengerInfo.email').isEmail().withMessage('Valid email is required'),
  body('passengerInfo.phone').notEmpty().withMessage('Phone number is required'),
  body('basePrice').isNumeric().withMessage('Base price must be a number'),
  body('totalPrice').isNumeric().withMessage('Total price must be a number'),
];

// Routes
router.get('/search-chauffeurs', protect, searchAvailableChauffeurs);
router.post('/validate-promo', protect, validatePromoCode);
router.post('/apply-promo', protect, applyPromoCode);
router.post('/', protect, bookingValidation, createBooking);
router.get('/', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id', protect, updateBooking);
router.put('/:id/payment', protect, updatePaymentStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.post('/:id/rebook', protect, rebookBooking);

module.exports = router;
