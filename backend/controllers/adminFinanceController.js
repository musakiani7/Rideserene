const Transaction = require('../models/Transaction');
const Payout = require('../models/Payout');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Chauffeur = require('../models/Chauffeur');

// @desc    Get all transactions
// @route   GET /api/admin/finance/transactions
// @access  Private (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      paymentMethod,
      startDate,
      endDate,
      search,
    } = req.query;

    const query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('chauffeur', 'firstName lastName email')
      .populate('booking', 'bookingReference totalPrice')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Transaction.countDocuments(query);

    // Calculate statistics
    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCommission: { $sum: '$commission.amount' },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      stats: stats[0] || {
        totalAmount: 0,
        totalCommission: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
      },
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get transaction by ID
// @route   GET /api/admin/finance/transactions/:id
// @access  Private (Admin)
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('chauffeur', 'firstName lastName email phone')
      .populate('booking');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get revenue analytics
// @route   GET /api/admin/finance/analytics
// @access  Private (Admin)
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      // Default to current month
      const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        createdAt: {
          $gte: startOfPeriod,
          $lte: endOfPeriod,
        },
      };
    }

    // Overall revenue stats
    const revenueStats = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          totalCommission: { $sum: '$commission.amount' },
          totalTransactions: { $sum: 1 },
          avgTransactionValue: { $avg: '$amount' },
        },
      },
    ]);

    // Revenue by payment method
    const revenueByMethod = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Revenue by type
    const revenueByType = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Daily revenue trend
    const dailyRevenue = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
          commission: { $sum: '$commission.amount' },
          transactions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top customers by spending
    const topCustomers = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed', type: 'booking_payment' } },
      {
        $group: {
          _id: '$customer',
          totalSpent: { $sum: '$amount' },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customer',
        },
      },
      { $unwind: '$customer' },
      {
        $project: {
          customer: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          totalSpent: 1,
          bookings: 1,
        },
      },
    ]);

    // Pending payouts
    const pendingPayouts = await Payout.aggregate([
      { $match: { status: { $in: ['pending', 'approved'] } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: revenueStats[0] || {
          totalRevenue: 0,
          totalCommission: 0,
          totalTransactions: 0,
          avgTransactionValue: 0,
        },
        byPaymentMethod: revenueByMethod,
        byType: revenueByType,
        dailyTrend: dailyRevenue,
        topCustomers,
        pendingPayouts: pendingPayouts[0] || { totalAmount: 0, count: 0 },
      },
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get commission reports
// @route   GET /api/admin/finance/commission-reports
// @access  Private (Admin)
exports.getCommissionReports = async (req, res) => {
  try {
    const { period = 'month', startDate, endDate } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    } else {
      const startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfPeriod = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateFilter = {
        createdAt: {
          $gte: startOfPeriod,
          $lte: endOfPeriod,
        },
      };
    }

    // Total commission earned
    const totalCommission = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commission.amount' },
          totalRevenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        },
      },
    ]);

    // Commission by chauffeur
    const commissionByChauffeur = await Transaction.aggregate([
      {
        $match: {
          ...dateFilter,
          status: 'completed',
          chauffeur: { $exists: true },
        },
      },
      {
        $group: {
          _id: '$chauffeur',
          commission: { $sum: '$commission.amount' },
          revenue: { $sum: '$amount' },
          rides: { $sum: 1 },
        },
      },
      { $sort: { commission: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'chauffeurs',
          localField: '_id',
          foreignField: '_id',
          as: 'chauffeur',
        },
      },
      { $unwind: '$chauffeur' },
      {
        $project: {
          chauffeur: {
            firstName: 1,
            lastName: 1,
            email: 1,
          },
          commission: 1,
          revenue: 1,
          rides: 1,
          commissionRate: {
            $multiply: [{ $divide: ['$commission', '$revenue'] }, 100],
          },
        },
      },
    ]);

    // Commission trend over time
    const commissionTrend = await Transaction.aggregate([
      { $match: { ...dateFilter, status: 'completed' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          commission: { $sum: '$commission.amount' },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: totalCommission[0] || {
          totalCommission: 0,
          totalRevenue: 0,
          transactions: 0,
        },
        byChauffeur: commissionByChauffeur,
        trend: commissionTrend,
      },
    });
  } catch (error) {
    console.error('Get commission reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get all payouts
// @route   GET /api/admin/finance/payouts
// @access  Private (Admin)
exports.getAllPayouts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, chauffeurId } = req.query;

    const query = {};
    if (status) query.status = status;
    if (chauffeurId) query.chauffeur = chauffeurId;

    const payouts = await Payout.find(query)
      .populate('chauffeur', 'firstName lastName email phone')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Payout.countDocuments(query);

    // Calculate stats
    const stats = await Payout.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: payouts,
      stats: stats[0] || { totalAmount: 0, pending: 0, completed: 0 },
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get payout by ID
// @route   GET /api/admin/finance/payouts/:id
// @access  Private (Admin)
exports.getPayoutById = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id)
      .populate('chauffeur')
      .populate('bookings')
      .populate('transactions')
      .populate('approvedBy', 'firstName lastName');

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    res.status(200).json({
      success: true,
      data: payout,
    });
  } catch (error) {
    console.error('Get payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Approve payout
// @route   PUT /api/admin/finance/payouts/:id/approve
// @access  Private (Admin)
exports.approvePayout = async (req, res) => {
  try {
    const { notes } = req.body;
    const adminId = req.admin._id;

    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payouts can be approved',
      });
    }

    payout.status = 'approved';
    payout.approvedBy = adminId;
    payout.approvedAt = new Date();
    if (notes) payout.notes = notes;

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout approved successfully',
      data: payout,
    });
  } catch (error) {
    console.error('Approve payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Process payout (mark as completed)
// @route   PUT /api/admin/finance/payouts/:id/process
// @access  Private (Admin)
exports.processPayout = async (req, res) => {
  try {
    const payout = await Payout.findById(req.params.id);

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found',
      });
    }

    if (payout.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Only approved payouts can be processed',
      });
    }

    payout.status = 'completed';
    payout.completedAt = new Date();

    // Update related transactions
    await Transaction.updateMany(
      { _id: { $in: payout.transactions } },
      { 'chauffeurPayout.status': 'paid', 'chauffeurPayout.paidAt': new Date() }
    );

    await payout.save();

    res.status(200).json({
      success: true,
      message: 'Payout processed successfully',
      data: payout,
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Export transactions
// @route   GET /api/admin/finance/transactions/export
// @access  Private (Admin)
exports.exportTransactions = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;

    const query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('chauffeur', 'firstName lastName')
      .populate('booking', 'bookingReference')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Export transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
