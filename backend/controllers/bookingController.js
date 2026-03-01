const Booking = require('../models/Booking');
const Refund = require('../models/Refund');
const PromoCode = require('../models/PromoCode');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');
const { validationResult } = require('express-validator');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', '),
        errors: errors.array() 
      });
    }

    const {
      rideType,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      duration,
      estimatedDistance,
      estimatedArrivalTime,
      vehicleClass,
      passengerInfo,
      basePrice,
      taxes,
      fees,
      discount,
      totalPrice,
      currency
    } = req.body;

    // Log user info for debugging
    console.log('Creating booking for user:', req.user?.id);
    console.log('Request body:', req.body);

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id, // from auth middleware
      rideType,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      pickupTime,
      duration,
      estimatedDistance,
      estimatedArrivalTime,
      vehicleClass,
      passengerInfo,
      basePrice,
      taxes: taxes || 0,
      fees: fees || 0,
      discount: discount || 0,
      totalPrice,
      currency: currency || 'USD',
      status: 'pending',
      paymentStatus: 'pending',
    });

    console.log('Booking created:', booking._id, booking.bookingReference);

    // Fire-and-forget notification + email (do not block response)
    (async () => {
      try {
        const customer = await Customer.findById(req.user.id);
        if (!customer) return;

        await Notification.create({
          customer: customer._id,
          booking: booking._id,
          type: 'booking_created',
          title: 'Booking confirmed',
          message: `Your booking ${booking.bookingReference} has been created successfully.`,
        });

        const wantsEmail =
          !customer.preferences ||
          !customer.preferences.notifications ||
          customer.preferences.notifications.email !== false;

        if (wantsEmail) {
          const pickupAddress = pickupLocation?.address || 'your pickup location';
          const dropoffAddress = dropoffLocation?.address || 'destination';
          const subject = `Your booking ${booking.bookingReference} is confirmed`;
          const text = [
            `Hi ${customer.firstName || ''},`,
            '',
            'Thank you for booking with RideSerene.',
            '',
            `Booking Reference: ${booking.bookingReference}`,
            `Pickup: ${pickupAddress}`,
            dropoffLocation?.address ? `Drop-off: ${dropoffAddress}` : '',
            `Date & Time: ${new Date(pickupDate).toLocaleDateString()} at ${pickupTime}`,
            '',
            'You can view details and download your invoice from your customer dashboard.',
          ].join('\n');

          await sendEmail({
            to: customer.email,
            subject,
            text,
          });
        }
      } catch (notifyError) {
        console.error('Booking notification/email error:', notifyError);
      }
    })();

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        totalPrice: booking.totalPrice,
        currency: booking.currency,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      details: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone vehicleInfo');

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.customer._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to access this booking' 
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get all bookings for logged in customer
// @route   GET /api/bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('chauffeur', 'firstName lastName phone vehicleInfo');

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update booking payment status
// @route   PUT /api/bookings/:id/payment
// @access  Private
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, transactionId, paymentIntentId } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this booking' 
      });
    }

    booking.paymentStatus = paymentStatus;
    booking.paymentMethod = paymentMethod;
    booking.transactionId = transactionId;
    booking.paymentIntentId = paymentIntentId;

    if (paymentStatus === 'completed') {
      booking.paidAt = Date.now();
      booking.status = 'confirmed';
    }

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Payment status updated',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        paymentStatus: booking.paymentStatus,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating payment status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to update this booking' 
      });
    }

    // Check if booking can be updated (only pending or confirmed)
    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot update booking with status: ${booking.status}` 
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'pickupLocation',
      'dropoffLocation',
      'pickupDate',
      'pickupTime',
      'duration',
      'passengerInfo',
      'vehicleClass',
      'estimatedDistance',
      'estimatedArrivalTime',
      'basePrice',
      'taxes',
      'fees',
      'discount',
      'totalPrice',
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    booking.updatedAt = Date.now();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ 
        success: false, 
        message: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.customer.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to cancel this booking' 
      });
    }

    // Check if booking can be cancelled (e.g., not already completed)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot cancel booking with status: ${booking.status}` 
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancelledAt = Date.now();

    await booking.save();

    // Automatically create a refund request for cancelled booking
    try {
      // Check if refund already exists
      const existingRefund = await Refund.findOne({
        booking: booking._id,
        customer: booking.customer
      });

      if (!existingRefund && booking.totalPrice > 0) {
        await Refund.create({
          customer: booking.customer,
          booking: booking._id,
          amount: booking.totalPrice,
          reason: 'booking_cancellation',
          refundMethod: 'wallet',
          notes: cancellationReason ? `Cancellation reason: ${cancellationReason}` : 'Booking cancelled by customer',
          status: 'pending',
          requestedAt: new Date()
        });
      }
    } catch (refundError) {
      console.error('Error creating refund:', refundError);
      // Don't fail the cancellation if refund creation fails
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. A refund request has been created.',
      booking: {
        id: booking._id,
        bookingReference: booking.bookingReference,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error cancelling booking',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Re-book a past ride (clone booking)
// @route   POST /api/bookings/:id/rebook
// @access  Private
exports.rebookBooking = async (req, res) => {
  try {
    const original = await Booking.findById(req.params.id);

    if (!original) {
      return res.status(404).json({
        success: false,
        message: 'Original booking not found',
      });
    }

    // Ensure the logged-in customer owns the original booking
    if (original.customer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to re-book this ride',
      });
    }

    // Optionally allow client to override date/time, otherwise default to tomorrow, same time
    let { pickupDate, pickupTime } = req.body || {};

    const originalPickupDate = new Date(original.pickupDate);
    if (!pickupDate) {
      const nextDay = new Date();
      nextDay.setDate(nextDay.getDate() + 1);
      pickupDate = nextDay.toISOString();
    }

    if (!pickupTime) {
      pickupTime = original.pickupTime || '12:00';
    }

    const newBooking = await Booking.create({
      customer: req.user.id,
      rideType: original.rideType,
      pickupLocation: original.pickupLocation,
      dropoffLocation: original.dropoffLocation,
      pickupDate,
      pickupTime,
      duration: original.duration,
      estimatedDistance: original.estimatedDistance,
      estimatedArrivalTime: original.estimatedArrivalTime,
      vehicleClass: original.vehicleClass,
      passengerInfo: original.passengerInfo,
      basePrice: original.basePrice,
      taxes: original.taxes || 0,
      fees: original.fees || 0,
      discount: 0, // apply fresh discounts if any in checkout flow
      totalPrice: original.totalPrice,
      currency: original.currency || 'USD',
      status: 'pending',
      paymentStatus: 'pending',
      notes: `Re-booked from ${original.bookingReference}`,
    });

    res.status(201).json({
      success: true,
      message: 'Ride re-booked successfully',
      booking: {
        id: newBooking._id,
        bookingReference: newBooking.bookingReference,
        totalPrice: newBooking.totalPrice,
        currency: newBooking.currency,
        status: newBooking.status,
        paymentStatus: newBooking.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Re-book booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error re-booking ride',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Search available chauffeurs
// @route   GET /api/bookings/search-chauffeurs
// @access  Private
exports.searchAvailableChauffeurs = async (req, res) => {
  try {
    const Chauffeur = require('../models/Chauffeur');
    const { vehicleType } = req.query;

    // Build query for approved chauffeurs only
    const query = { status: 'approved' };

    // Filter by vehicle type if provided
    if (vehicleType) {
      query['vehicleInfo.type'] = { $regex: vehicleType, $options: 'i' };
    }

    const chauffeurs = await Chauffeur.find(query)
      .select('firstName lastName email phone status vehicleInfo yearsOfExperience')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: chauffeurs,
      total: chauffeurs.length,
    });
  } catch (error) {
    console.error('Search chauffeurs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching chauffeurs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Validate promo code
// @route   POST /api/bookings/validate-promo
// @access  Private
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, bookingAmount } = req.body;

    if (!code || !bookingAmount) {
      return res.status(400).json({
        success: false,
        message: 'Promo code and booking amount are required',
      });
    }

    // Find promo code (case-insensitive)
    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code',
      });
    }

    // Check if promo code is expired
    const now = new Date();
    if (now < promoCode.validFrom) {
      return res.status(400).json({
        success: false,
        message: `Promo code is not yet valid. Valid from ${promoCode.validFrom.toLocaleDateString()}`,
      });
    }

    if (now > promoCode.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Promo code has expired',
      });
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promo code usage limit has been reached',
      });
    }

    // Check minimum amount
    if (bookingAmount < promoCode.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of $${promoCode.minAmount} required to use this promo code`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.discountType === 'percentage') {
      discountAmount = (bookingAmount * promoCode.discountValue) / 100;
      
      // Apply max discount if specified
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    } else {
      // Fixed amount discount
      discountAmount = promoCode.discountValue;
      
      // Discount cannot exceed booking amount
      if (discountAmount > bookingAmount) {
        discountAmount = bookingAmount;
      }
    }

    const finalAmount = bookingAmount - discountAmount;

    res.status(200).json({
      success: true,
      message: 'Promo code applied successfully',
      data: {
        promoCode: {
          code: promoCode.code,
          description: promoCode.description,
          discountType: promoCode.discountType,
          discountValue: promoCode.discountValue,
        },
        originalAmount: bookingAmount,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2),
        savings: discountAmount.toFixed(2),
      },
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Apply promo code to booking (increment usage count)
// @route   POST /api/bookings/apply-promo
// @access  Private
exports.applyPromoCode = async (req, res) => {
  try {
    const { code } = req.body;

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Invalid promo code',
      });
    }

    // Increment usage count
    promoCode.usedCount += 1;
    await promoCode.save();

    res.status(200).json({
      success: true,
      message: 'Promo code applied successfully',
    });
  } catch (error) {
    console.error('Apply promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

