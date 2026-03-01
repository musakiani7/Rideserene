const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/email');

// @desc    Get all bookings with filters
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, search, startDate, endDate, page = 1, limit = 20 } = req.query;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      // First try to find matching customer
      const Customer = require('../models/Customer');
      const customers = await Customer.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const customerIds = customers.map(c => c._id);
      
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { customer: { $in: customerIds } }
      ];
    }

    if (startDate || endDate) {
      query.pickupDate = {};
      if (startDate) {
        const d = new Date(startDate);
        d.setHours(0, 0, 0, 0);
        query.pickupDate.$gte = d;
      }
      if (endDate) {
        const d = new Date(endDate);
        d.setHours(23, 59, 59, 999);
        query.pickupDate.$lte = d;
      }
    }

    // Execute query with pagination (Booking has pickupDate, not vehicleClass ref)
    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bookings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get booking by ID
// @route   GET /api/admin/bookings/:id
// @access  Private (Admin)
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName phone email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id/status
// @access  Private (Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Assign chauffeur to booking
// @route   PUT /api/admin/bookings/:id/assign
// @access  Private (Admin)
exports.assignChauffeur = async (req, res) => {
  try {
    const { chauffeurId } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'firstName lastName email preferences')
      .populate('chauffeur', 'firstName lastName');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.chauffeur = chauffeurId;
    booking.status = 'assigned';
    booking.assignedAt = new Date();
    await booking.save();

    // Fire-and-forget notification + email to customer
    (async () => {
      try {
        const customer = await Customer.findById(booking.customer._id || booking.customer);
        if (!customer) return;

        await Notification.create({
          customer: customer._id,
          booking: booking._id,
          type: 'chauffeur_assigned',
          title: 'Chauffeur assigned to your ride',
          message: `A chauffeur has been assigned to your booking ${booking.bookingReference}.`,
        });

        const wantsEmail =
          !customer.preferences ||
          !customer.preferences.notifications ||
          customer.preferences.notifications.email !== false;

        if (wantsEmail) {
          const subject = `Chauffeur assigned – booking ${booking.bookingReference}`;
          const text = [
            `Hi ${customer.firstName || ''},`,
            '',
            'Good news! A chauffeur has been assigned to your upcoming ride.',
            '',
            `Booking Reference: ${booking.bookingReference}`,
            booking.chauffeur
              ? `Chauffeur: ${booking.chauffeur.firstName} ${booking.chauffeur.lastName}`
              : '',
            '',
            'You can view the latest status from your customer dashboard under Upcoming Rides.',
          ].join('\n');

          await sendEmail({
            to: customer.email,
            subject,
            text,
          });
        }
      } catch (notifyError) {
        console.error('Chauffeur assignment notification/email error:', notifyError);
      }
    })();

    res.status(200).json({
      success: true,
      message: 'Chauffeur assigned successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Cancel booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private (Admin)
exports.cancelBooking = async (req, res) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by admin';
    booking.cancelledAt = new Date();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update booking details
// @route   PUT /api/admin/bookings/:id
// @access  Private (Admin)
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      'pickupDate',
      'pickupTime',
      'pickupLocation',
      'dropoffLocation',
      'notes',
      'specialRequests',
      'passengerInfo',
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        booking[field] = req.body[field];
      }
    });

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/admin/bookings/stats
// @access  Private (Admin)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const inProgressBookings = await Booking.countDocuments({ status: 'in-progress' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });

    // Revenue statistics
    const completedRevenue = await Booking.aggregate([
      { $match: { status: 'completed', paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    const pendingRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['pending', 'confirmed', 'in-progress'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysBookings = await Booking.countDocuments({
      pickupDate: { $gte: today, $lt: tomorrow },
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        inProgressBookings,
        completedBookings,
        cancelledBookings,
        todaysBookings,
        completedRevenue: completedRevenue[0]?.total || 0,
        pendingRevenue: pendingRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Bulk update booking status
// @route   PUT /api/admin/bookings/bulk-status
// @access  Private (Admin)
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { bookingIds, status } = req.body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of booking IDs',
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status',
      });
    }

    const result = await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { $set: { status, updatedAt: Date.now() } }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} bookings updated successfully`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
