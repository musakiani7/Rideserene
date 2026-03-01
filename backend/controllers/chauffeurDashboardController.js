const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Chauffeur = require('../models/Chauffeur');
const Payout = require('../models/Payout');
const Review = require('../models/Review');

// @desc    Get chauffeur dashboard overview
// @route   GET /api/chauffeur/dashboard/overview
// @access  Private (Chauffeur)
exports.getOverview = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get this week's date range
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Count today's rides
    const todayRides = await Booking.countDocuments({
      chauffeur: chauffeurId,
      pickupDate: { $gte: today, $lt: tomorrow },
    });

    // Count this week's rides
    const weekRides = await Booking.countDocuments({
      chauffeur: chauffeurId,
      pickupDate: { $gte: weekStart, $lt: weekEnd },
    });

    // Calculate today's earnings
    const todayEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: today, $lt: tomorrow },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    // Calculate this week's earnings
    const weekEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: weekStart, $lt: weekEnd },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]);

    // Get chauffeur rating
    const chauffeur = await Chauffeur.findById(chauffeurId);

    res.status(200).json({
      success: true,
      data: {
        todayRides,
        weekRides,
        todayEarnings: todayEarnings[0]?.total || 0,
        weekEarnings: weekEarnings[0]?.total || 0,
        rating: chauffeur?.rating || 0,
        totalRatings: chauffeur?.totalRatings || 0,
      },
    });
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard overview',
    });
  }
};

// @desc    Get today's rides
// @route   GET /api/chauffeur/dashboard/today-rides
// @access  Private (Chauffeur)
exports.getTodayRides = async (req, res) => {
  try {
    console.log('🔍 getTodayRides called by chauffeur:', req.chauffeur?._id);
    
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log('📅 Today date:', today);

    // Get all upcoming rides (today and future)
    const rides = await Booking.find({
      pickupDate: { $gte: today },
      status: { $in: ['pending', 'confirmed', 'assigned'] },
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .populate('chauffeur', 'firstName lastName phone vehicleInfo')
      .sort({ pickupDate: 1, pickupTime: 1 })
      .limit(50);

    console.log('✅ Found rides:', rides.length);
    console.log('📊 Rides:', rides.map(r => ({ ref: r.bookingReference, status: r.status, date: r.pickupDate })));

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('❌ Get today rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s rides',
    });
  }
};

// @desc    Get pending ride requests (not yet assigned) for all chauffeurs
//          Shown in Ride Management on every chauffeur dashboard
// @route   GET /api/chauffeur/dashboard/rides/requests
// @access  Private (Chauffeur)
exports.getRideRequests = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur._id;

    // All pending bookings with no chauffeur assigned — visible to every chauffeur
    // Exclude only those this chauffeur has explicitly declined
    const requests = await Booking.find({
      status: 'pending',
      $and: [
        {
          $or: [
            { chauffeur: { $exists: false } },
            { chauffeur: null },
          ],
        },
        {
          $or: [
            { declinedByChauffeurs: { $exists: false } },
            { declinedByChauffeurs: [] },
            { declinedByChauffeurs: { $nin: [chauffeurId] } },
          ],
        },
      ],
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .sort({ createdAt: -1, pickupDate: 1, pickupTime: 1 })
      .limit(100)
      .lean();

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[getRideRequests] chauffeur=${chauffeurId} → ${requests.length} pending requests`);
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('❌ Get ride requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride requests',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get upcoming rides for the logged-in chauffeur
// @route   GET /api/chauffeur/dashboard/rides/upcoming
// @access  Private (Chauffeur)
exports.getUpcomingRides = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rides = await Booking.find({
      chauffeur: chauffeurId,
      pickupDate: { $gte: today },
      status: { $in: ['confirmed', 'assigned', 'in-progress'] },
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .sort({ pickupDate: 1, pickupTime: 1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('❌ Get upcoming rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming rides',
    });
  }
};

// @desc    Get completed rides for the logged-in chauffeur
// @route   GET /api/chauffeur/dashboard/rides/completed
// @access  Private (Chauffeur)
exports.getCompletedRides = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur._id;

    const rides = await Booking.find({
      chauffeur: chauffeurId,
      status: 'completed',
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .sort({ completedAt: -1, pickupDate: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('❌ Get completed rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching completed rides',
    });
  }
};

// @desc    Get ride history with optional date and status filters
// @route   GET /api/chauffeur/dashboard/rides/history?dateFrom=&dateTo=&status=
// @access  Private (Chauffeur)
exports.getRideHistory = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur._id;
    const { dateFrom, dateTo, status } = req.query;

    const filter = { chauffeur: chauffeurId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (dateFrom || dateTo) {
      filter.pickupDate = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        filter.pickupDate.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.pickupDate.$lte = to;
      }
    }

    const rides = await Booking.find(filter)
      .populate('customer', 'firstName lastName email phone profileImage')
      .sort({ pickupDate: -1, createdAt: -1 })
      .limit(100)
      .lean();

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('❌ Get ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride history',
    });
  }
};

// @desc    Get earnings data
// @route   GET /api/chauffeur/dashboard/earnings
// @access  Private (Chauffeur)
exports.getEarnings = async (req, res) => {
  try {
    const chauffeurId = new mongoose.Types.ObjectId(req.chauffeur.id);

    console.log('💰 Fetching earnings for chauffeur:', chauffeurId);

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Get all completed rides with payment details
    const completedRides = await Booking.find({
      chauffeur: chauffeurId,
      status: { $in: ['completed', 'assigned'] },
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .sort({ pickupDate: -1, createdAt: -1 })
      .limit(100);

    // Daily earnings for the past 30 days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const dailyEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: thirtyDaysAgo },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$pickupDate' } },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Weekly earnings for the past 12 weeks
    const twelveWeeksAgo = new Date(today);
    twelveWeeksAgo.setDate(today.getDate() - 84);
    
    const weeklyEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: twelveWeeksAgo },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: '$pickupDate' },
            week: { $week: '$pickupDate' }
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.week': 1 },
      },
    ]);

    // Monthly earnings for the past 12 months
    const twelveMonthsAgo = new Date(today);
    twelveMonthsAgo.setMonth(today.getMonth() - 12);
    
    const monthlyEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: twelveMonthsAgo },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: { 
            year: { $year: '$pickupDate' },
            month: { $month: '$pickupDate' }
          },
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Summary statistics
    const todayEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: today },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    const weekEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: weekStart },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    const monthEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          pickupDate: { $gte: monthStart },
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEarnings = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
          status: { $in: ['completed', 'assigned'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
    ]);

    console.log('✅ Earnings calculated:', {
      today: todayEarnings[0]?.total || 0,
      week: weekEarnings[0]?.total || 0,
      month: monthEarnings[0]?.total || 0,
      total: totalEarnings[0]?.total || 0,
      ridesCount: completedRides.length
    });

    res.status(200).json({
      success: true,
      data: {
        summary: {
          today: todayEarnings[0]?.total || 0,
          todayRides: todayEarnings[0]?.count || 0,
          week: weekEarnings[0]?.total || 0,
          weekRides: weekEarnings[0]?.count || 0,
          month: monthEarnings[0]?.total || 0,
          monthRides: monthEarnings[0]?.count || 0,
          total: totalEarnings[0]?.total || 0,
          totalRides: totalEarnings[0]?.count || 0,
        },
        dailyEarnings,
        weeklyEarnings,
        monthlyEarnings,
        completedRides,
      },
    });
  } catch (error) {
    console.error('❌ Get earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching earnings data',
    });
  }
};

// @desc    Update online status
// @route   PUT /api/chauffeur/dashboard/online-status
// @access  Private (Chauffeur)
exports.updateOnlineStatus = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { isOnline } = req.body;

    const chauffeur = await Chauffeur.findByIdAndUpdate(
      chauffeurId,
      { isOnline },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Status updated to ${isOnline ? 'online' : 'offline'}`,
      data: {
        isOnline: chauffeur.isOnline,
      },
    });
  } catch (error) {
    console.error('Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating online status',
    });
  }
};

// @desc    Get vehicle and documents info
// @route   GET /api/chauffeur/dashboard/vehicle
// @access  Private (Chauffeur)
exports.getVehicleInfo = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;

    const chauffeur = await Chauffeur.findById(chauffeurId).select(
      'vehicle documents licenseExpiryDate'
    );

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    // Check for expiring documents (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const warnings = [];

    if (chauffeur.licenseExpiryDate && new Date(chauffeur.licenseExpiryDate) <= thirtyDaysFromNow) {
      warnings.push({
        type: 'license',
        message: 'Driver license expiring soon',
        expiryDate: chauffeur.licenseExpiryDate,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        vehicle: chauffeur.vehicle,
        documents: chauffeur.documents,
        warnings,
      },
    });
  } catch (error) {
    console.error('Get vehicle info error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vehicle information',
    });
  }
};

// @desc    Get ratings and feedback (uses Review model)
// @route   GET /api/chauffeur/dashboard/ratings
// @access  Private (Chauffeur)
exports.getRatings = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;

    const chauffeur = await Chauffeur.findById(chauffeurId).select('rating totalRatings');

    const reviews = await Review.find({ chauffeur: chauffeurId, isVisible: true })
      .populate('customer', 'firstName lastName')
      .populate('booking', 'bookingReference pickupDate')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      data: {
        averageRating: chauffeur?.rating ?? 0,
        totalRatings: chauffeur?.totalRatings ?? 0,
        reviews,
      },
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ratings',
    });
  }
};

// @desc    Update ride status
// @route   PUT /api/chauffeur/dashboard/rides/:id/status
// @access  Private (Chauffeur)
exports.updateRideStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const chauffeurId = req.chauffeur.id;

    const booking = await Booking.findOne({
      _id: id,
      chauffeur: chauffeurId,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Validate status transition
    const validStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Ride status updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Update ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ride status',
    });
  }
};

// Approve a pending ride
exports.approveRide = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;

    console.log('🔍 Approving ride:', id, 'by chauffeur:', chauffeurId);

    // Find the booking
    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check if booking is pending
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending rides can be approved',
      });
    }

    // Check if already assigned to another chauffeur
    if (booking.chauffeur && booking.chauffeur.toString() !== chauffeurId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'This ride is already assigned to another chauffeur',
      });
    }

    // Assign chauffeur and update status
    booking.chauffeur = chauffeurId;
    booking.status = 'assigned';
    booking.assignedAt = new Date();
    await booking.save();

    // Populate customer and chauffeur data for response
    await booking.populate('customer', 'firstName lastName email phone');
    await booking.populate('chauffeur', 'firstName lastName phone vehicleInfo');

    console.log('✅ Ride approved:', booking.bookingReference);

    res.status(200).json({
      success: true,
      message: 'Ride approved successfully',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Approve ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving ride',
    });
  }
};

// @desc    Decline a pending ride request for this chauffeur
//          Marks the request as declined by this chauffeur without cancelling it
// @route   PUT /api/chauffeur/dashboard/rides/:id/decline
// @access  Private (Chauffeur)
exports.declineRide = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending ride requests can be declined',
      });
    }

    // Ensure array exists
    if (!Array.isArray(booking.declinedByChauffeurs)) {
      booking.declinedByChauffeurs = [];
    }

    const alreadyDeclined = booking.declinedByChauffeurs.some(
      (cId) => cId.toString() === chauffeurId.toString()
    );

    if (!alreadyDeclined) {
      booking.declinedByChauffeurs.push(chauffeurId);
      await booking.save();
    }

    res.status(200).json({
      success: true,
      message: 'Ride request declined for this chauffeur',
      data: {
        id: booking._id,
        status: booking.status,
      },
    });
  } catch (error) {
    console.error('❌ Decline ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Error declining ride',
    });
  }
};

// @desc    Start a ride
// @route   PUT /api/chauffeur/dashboard/rides/:id/start
// @access  Private (Chauffeur)
exports.startRide = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;

    console.log('🚗 Starting ride:', id, 'by chauffeur:', chauffeurId);

    const booking = await Booking.findOne({
      _id: id,
      chauffeur: chauffeurId,
      status: { $in: ['confirmed', 'assigned'] }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you',
      });
    }

    booking.status = 'in-progress';
    booking.startedAt = new Date();
    await booking.save();

    await booking.populate('customer', 'firstName lastName email phone');
    await booking.populate('chauffeur', 'firstName lastName phone vehicleInfo');

    console.log('✅ Ride started:', booking.bookingReference);

    res.status(200).json({
      success: true,
      message: 'Ride started successfully',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Start ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting ride',
    });
  }
};

// @desc    Complete a ride
// @route   PUT /api/chauffeur/dashboard/rides/:id/complete
// @access  Private (Chauffeur)
exports.completeRide = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;
    const { notes, actualEndTime, actualDropoffLocation } = req.body;

    console.log('✅ Completing ride:', id, 'by chauffeur:', chauffeurId);

    const booking = await Booking.findOne({
      _id: id,
      chauffeur: chauffeurId,
      status: 'in-progress'
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found, not assigned to you, or not in progress',
      });
    }

    booking.status = 'completed';
    booking.completedAt = new Date();
    if (notes) booking.notes = notes;
    if (actualEndTime) booking.actualEndTime = actualEndTime;
    if (actualDropoffLocation) booking.actualDropoffLocation = actualDropoffLocation;

    await booking.save();

    await booking.populate('customer', 'firstName lastName email phone');
    await booking.populate('chauffeur', 'firstName lastName phone vehicleInfo');

    console.log('✅ Ride completed:', booking.bookingReference);

    res.status(200).json({
      success: true,
      message: 'Ride completed successfully',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Complete ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing ride',
    });
  }
};

// @desc    Cancel a ride (by chauffeur)
// @route   PUT /api/chauffeur/dashboard/rides/:id/cancel
// @access  Private (Chauffeur)
exports.cancelRide = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;
    const { reason } = req.body;

    console.log('❌ Cancelling ride:', id, 'by chauffeur:', chauffeurId);

    const booking = await Booking.findOne({
      _id: id,
      chauffeur: chauffeurId,
      status: { $in: ['assigned', 'confirmed'] }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found, not assigned to you, or cannot be cancelled',
      });
    }

    // Remove chauffeur assignment and set back to pending
    booking.chauffeur = null;
    booking.status = 'pending';
    booking.notes = booking.notes 
      ? `${booking.notes}\nChauffeur cancelled: ${reason || 'No reason provided'}`
      : `Chauffeur cancelled: ${reason || 'No reason provided'}`;

    await booking.save();

    await booking.populate('customer', 'firstName lastName email phone');

    console.log('✅ Ride cancelled:', booking.bookingReference);

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: booking,
    });
  } catch (error) {
    console.error('❌ Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling ride',
    });
  }
};

// @desc    Get single ride details
// @route   GET /api/chauffeur/dashboard/rides/:id
// @access  Private (Chauffeur)
exports.getRideDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const chauffeurId = req.chauffeur._id;

    const booking = await Booking.findOne({
      _id: id,
      chauffeur: chauffeurId
    })
      .populate('customer', 'firstName lastName email phone profileImage')
      .populate('chauffeur', 'firstName lastName phone vehicleInfo email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found or not assigned to you',
      });
    }

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('❌ Get ride details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride details',
    });
  }
};

// @desc    Get chauffeur's ride statistics
// @route   GET /api/chauffeur/dashboard/ride-stats
// @access  Private (Chauffeur)
exports.getRideStats = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = await Booking.aggregate([
      {
        $match: {
          chauffeur: chauffeurId,
        },
      },
      {
        $facet: {
          total: [{ $count: 'count' }],
          completed: [
            { $match: { status: 'completed' } },
            { $count: 'count' }
          ],
          inProgress: [
            { $match: { status: 'in-progress' } },
            { $count: 'count' }
          ],
          upcoming: [
            { 
              $match: { 
                status: { $in: ['assigned', 'confirmed'] },
                pickupDate: { $gte: today }
              } 
            },
            { $count: 'count' }
          ],
          today: [
            {
              $match: {
                pickupDate: { $gte: today },
                status: { $in: ['assigned', 'confirmed', 'in-progress'] }
              }
            },
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: stats[0].total[0]?.count || 0,
        completed: stats[0].completed[0]?.count || 0,
        inProgress: stats[0].inProgress[0]?.count || 0,
        upcoming: stats[0].upcoming[0]?.count || 0,
        today: stats[0].today[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('❌ Get ride stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride statistics',
    });
  }
};

// @desc    Update chauffeur availability
// @route   PUT /api/chauffeur/dashboard/availability
// @access  Private (Chauffeur)
exports.updateAvailability = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { availability } = req.body;

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Availability data is required',
      });
    }

    // Update chauffeur availability
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      chauffeurId,
      { availability },
      { new: true, runValidators: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      data: chauffeur.availability,
    });
  } catch (error) {
    console.error('❌ Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating availability',
    });
  }
};

// @desc    Get chauffeur availability
// @route   GET /api/chauffeur/dashboard/availability
// @access  Private (Chauffeur)
exports.getAvailability = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;

    const chauffeur = await Chauffeur.findById(chauffeurId).select('availability');

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.json({
      success: true,
      data: chauffeur.availability || {},
    });
  } catch (error) {
    console.error('❌ Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching availability',
    });
  }
};

// @desc    Request a payout
// @route   POST /api/chauffeur/dashboard/payouts/request
// @access  Private (Chauffeur)
exports.requestPayout = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { periodStart, periodEnd, paymentMethod, bankDetails } = req.body;

    // Validate required fields
    if (!periodStart || !periodEnd || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Period dates and payment method are required',
      });
    }

    // Convert to ObjectId
    const chauffeurObjectId = new mongoose.Types.ObjectId(chauffeurId);

    // Get completed rides for the period
    const completedRides = await Booking.find({
      chauffeur: chauffeurObjectId,
      status: 'completed',
      completedAt: {
        $gte: new Date(periodStart),
        $lte: new Date(periodEnd),
      },
    });

    // Check if rides exist
    if (completedRides.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No completed rides found for this period',
      });
    }

    // Check if rides are already included in another payout
    const rideIds = completedRides.map(ride => ride._id);
    const existingPayout = await Payout.findOne({
      rides: { $in: rideIds },
      status: { $in: ['pending', 'processing', 'completed'] },
    });

    if (existingPayout) {
      return res.status(400).json({
        success: false,
        message: 'Some rides are already included in another payout request',
      });
    }

    // Calculate amounts
    const grossAmount = completedRides.reduce((sum, ride) => sum + ride.totalPrice, 0);
    const commissionPercentage = 15; // 15% platform commission
    const commission = (grossAmount * commissionPercentage) / 100;
    const netAmount = grossAmount - commission;

    // Create payout request
    const payout = await Payout.create({
      chauffeur: chauffeurObjectId,
      amount: netAmount,
      grossAmount,
      netAmount,
      commission,
      commissionPercentage,
      periodStart: new Date(periodStart),
      periodEnd: new Date(periodEnd),
      paymentMethod,
      bankDetails: paymentMethod === 'bank_transfer' ? bankDetails : undefined,
      rides: rideIds,
      rideCount: completedRides.length,
      status: 'pending',
    });

    // Populate chauffeur details
    await payout.populate('chauffeur', 'firstName lastName email phone');

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      data: payout,
    });
  } catch (error) {
    console.error('❌ Request payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error requesting payout',
    });
  }
};

// @desc    Get payout history
// @route   GET /api/chauffeur/dashboard/payouts
// @access  Private (Chauffeur)
exports.getPayouts = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { status, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { chauffeur: new mongoose.Types.ObjectId(chauffeurId) };
    if (status) {
      query.status = status;
    }

    // Get payouts with pagination
    const skip = (page - 1) * parseInt(limit);
    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('rides', 'bookingReference totalPrice pickupDate status');

    // Get total count
    const total = await Payout.countDocuments(query);

    // Get summary statistics
    const summary = await Payout.aggregate([
      {
        $match: { chauffeur: new mongoose.Types.ObjectId(chauffeurId) },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
        summary,
      },
    });
  } catch (error) {
    console.error('❌ Get payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
    });
  }
};

// @desc    Get payout details
// @route   GET /api/chauffeur/dashboard/payouts/:id
// @access  Private (Chauffeur)
exports.getPayoutDetails = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { id } = req.params;

    const payout = await Payout.findOne({
      _id: id,
      chauffeur: new mongoose.Types.ObjectId(chauffeurId),
    })
      .populate('chauffeur', 'firstName lastName email phone')
      .populate({
        path: 'rides',
        select: 'bookingReference totalPrice pickupDate pickupTime pickupLocation dropoffLocation customer status',
        populate: {
          path: 'customer',
          select: 'firstName lastName email phone',
        },
      })
      .populate('processedBy', 'name email');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    res.json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error('❌ Get payout details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout details',
    });
  }
};

// @desc    Cancel payout request
// @route   PUT /api/chauffeur/dashboard/payouts/:id/cancel
// @access  Private (Chauffeur)
exports.cancelPayout = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const { id } = req.params;

    const payout = await Payout.findOne({
      _id: id,
      chauffeur: new mongoose.Types.ObjectId(chauffeurId),
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    // Can only cancel pending payouts
    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel payout with status: ${payout.status}`,
      });
    }

    payout.status = 'cancelled';
    await payout.save();

    res.json({
      success: true,
      message: 'Payout request cancelled successfully',
      data: payout,
    });
  } catch (error) {
    console.error('❌ Cancel payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling payout',
    });
  }
};

// @desc    Get available balance (unpaid earnings)
// @route   GET /api/chauffeur/dashboard/payouts/available-balance
// @access  Private (Chauffeur)
exports.getAvailableBalance = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;
    const chauffeurObjectId = new mongoose.Types.ObjectId(chauffeurId);

    // Get all completed rides
    const completedRides = await Booking.find({
      chauffeur: chauffeurObjectId,
      status: 'completed',
    });

    // Get ride IDs from completed or processing payouts
    const paidPayouts = await Payout.find({
      chauffeur: chauffeurObjectId,
      status: { $in: ['completed', 'processing'] },
    }).select('rides');

    const paidRideIds = new Set();
    paidPayouts.forEach(payout => {
      payout.rides.forEach(rideId => paidRideIds.add(rideId.toString()));
    });

    // Filter unpaid rides
    const unpaidRides = completedRides.filter(
      ride => !paidRideIds.has(ride._id.toString())
    );

    // Calculate available balance
    const grossAmount = unpaidRides.reduce((sum, ride) => sum + ride.totalPrice, 0);
    const commissionPercentage = 15;
    const commission = (grossAmount * commissionPercentage) / 100;
    const availableBalance = grossAmount - commission;

    // Get pending payout requests
    const pendingPayouts = await Payout.find({
      chauffeur: chauffeurObjectId,
      status: 'pending',
    }).select('netAmount createdAt');

    const pendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.netAmount, 0);

    res.json({
      success: true,
      data: {
        availableBalance,
        grossAmount,
        commission,
        commissionPercentage,
        unpaidRides: unpaidRides.length,
        pendingPayouts: pendingPayouts.length,
        pendingAmount,
        rides: unpaidRides.map(ride => ({
          id: ride._id,
          bookingReference: ride.bookingReference,
          date: ride.pickupDate,
          amount: ride.totalPrice,
          status: ride.status,
        })),
      },
    });
  } catch (error) {
    console.error('❌ Get available balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available balance',
    });
  }
};
