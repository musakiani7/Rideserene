const mongoose = require('mongoose');
const Payout = require('../models/Payout');
const Chauffeur = require('../models/Chauffeur');

// @desc    Get all payout requests
// @route   GET /api/admin/payouts
// @access  Private (Admin)
exports.getAllPayouts = async (req, res) => {
  try {
    const { status, chauffeur, startDate, endDate, limit = 50, page = 1 } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (chauffeur) query.chauffeur = new mongoose.Types.ObjectId(chauffeur);
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Get payouts with pagination
    const skip = (page - 1) * parseInt(limit);
    const payouts = await Payout.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .populate('chauffeur', 'firstName lastName email phone')
      .populate('processedBy', 'name email');

    // Get total count
    const total = await Payout.countDocuments(query);

    // Get summary statistics
    const summary = await Payout.aggregate([
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
    console.error('❌ Get all payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payouts',
    });
  }
};

// @desc    Get payout details
// @route   GET /api/admin/payouts/:id
// @access  Private (Admin)
exports.getPayoutDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const payout = await Payout.findById(id)
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

// @desc    Approve payout request
// @route   PUT /api/admin/payouts/:id/approve
// @access  Private (Admin)
exports.approvePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const payout = await Payout.findById(id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve payout with status: ${payout.status}`,
      });
    }

    payout.status = 'processing';
    payout.processedAt = new Date();
    payout.processedBy = req.admin.id;
    if (notes) payout.notes = notes;
    await payout.save();

    await payout.populate('chauffeur', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Payout approved and processing',
      data: payout,
    });
  } catch (error) {
    console.error('❌ Approve payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving payout',
    });
  }
};

// @desc    Complete payout
// @route   PUT /api/admin/payouts/:id/complete
// @access  Private (Admin)
exports.completePayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId, transactionReference, notes } = req.body;

    const payout = await Payout.findById(id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: `Cannot complete payout with status: ${payout.status}`,
      });
    }

    payout.status = 'completed';
    payout.completedAt = new Date();
    if (transactionId) payout.transactionId = transactionId;
    if (transactionReference) payout.transactionReference = transactionReference;
    if (notes) payout.notes = notes;
    await payout.save();

    await payout.populate('chauffeur', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Payout completed successfully',
      data: payout,
    });
  } catch (error) {
    console.error('❌ Complete payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing payout',
    });
  }
};

// @desc    Reject/Fail payout
// @route   PUT /api/admin/payouts/:id/reject
// @access  Private (Admin)
exports.rejectPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { failureReason } = req.body;

    if (!failureReason) {
      return res.status(400).json({
        success: false,
        message: 'Failure reason is required',
      });
    }

    const payout = await Payout.findById(id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (!['pending', 'processing'].includes(payout.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot reject payout with status: ${payout.status}`,
      });
    }

    payout.status = 'failed';
    payout.failedAt = new Date();
    payout.failureReason = failureReason;
    payout.processedBy = req.admin.id;
    await payout.save();

    await payout.populate('chauffeur', 'firstName lastName email phone');

    res.json({
      success: true,
      message: 'Payout rejected',
      data: payout,
    });
  } catch (error) {
    console.error('❌ Reject payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting payout',
    });
  }
};

// @desc    Get payout statistics
// @route   GET /api/admin/payouts/stats
// @access  Private (Admin)
exports.getPayoutStats = async (req, res) => {
  try {
    const { period = 'all' } = req.query;

    // Build date filter
    let dateFilter = {};
    if (period !== 'all') {
      const now = new Date();
      let startDate = new Date(now);

      switch (period) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      dateFilter = { createdAt: { $gte: startDate } };
    }

    // Get status summary
    const statusStats = await Payout.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    // Get payment method breakdown
    const paymentMethodStats = await Payout.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
    ]);

    // Get monthly trend (last 12 months)
    const monthlyTrend = await Payout.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
          avgAmount: { $avg: '$netAmount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Get top chauffeurs
    const topChauffeurs = await Payout.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$chauffeur',
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$netAmount' },
        },
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 },
    ]);

    // Populate chauffeur details
    const chauffeurIds = topChauffeurs.map(c => c._id);
    const chauffeurs = await Chauffeur.find({
      _id: { $in: chauffeurIds },
    }).select('firstName lastName email');

    const topChauffeurData = topChauffeurs.map(stat => {
      const chauffeur = chauffeurs.find(c => c._id.equals(stat._id));
      return {
        ...stat,
        chauffeur,
      };
    });

    res.json({
      success: true,
      data: {
        statusStats,
        paymentMethodStats,
        monthlyTrend,
        topChauffeurs: topChauffeurData,
      },
    });
  } catch (error) {
    console.error('❌ Get payout stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payout statistics',
    });
  }
};
