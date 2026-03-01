const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const Chauffeur = require('../models/Chauffeur');
const PromoCode = require('../models/PromoCode');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard overview stats
// @route   GET /api/admin/dashboard/overview
// @access  Private (Admin)
exports.getOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    // Total counts (Chauffeur uses status: pending|approved|rejected|suspended)
    const totalBookings = await Booking.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalChauffeurs = await Chauffeur.countDocuments();
    const activeChauffeurs = await Chauffeur.countDocuments({ status: 'approved', isActive: true });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['confirmed', 'assigned', 'in-progress'] } });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    // Active guests = customers with at least one booking
    const activeGuestsResult = await Booking.aggregate([
      { $group: { _id: '$customer' } },
      { $count: 'count' },
    ]);
    const activeGuests = activeGuestsResult[0]?.count ?? 0;

    // Today's stats
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
    const todayRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: today }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Yesterday's stats for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: yesterday, $lt: today }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // This month stats
    const monthBookings = await Booking.countDocuments({ createdAt: { $gte: thisMonth } });
    const monthRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: thisMonth }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Last month stats for comparison
    const lastMonthBookings = await Booking.countDocuments({ 
      createdAt: { $gte: lastMonth, $lt: thisMonth } 
    });
    const lastMonthRevenue = await Booking.aggregate([
      { $match: { createdAt: { $gte: lastMonth, $lt: thisMonth }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Calculate growth percentages
    const revenueGrowth = lastMonthRevenue[0]?.total 
      ? (((monthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100).toFixed(2)
      : 0;

    const bookingsGrowth = lastMonthBookings 
      ? (((monthBookings - lastMonthBookings) / lastMonthBookings) * 100).toFixed(2)
      : 0;

    // Total revenue (all time)
    const totalRevenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Total commission earned
    const totalCommission = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$commission.amount' } } },
    ]);

    // Recent bookings
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('customer', 'firstName lastName email')
      .populate('chauffeur', 'firstName lastName');

    // Booking status distribution
    const bookingsByStatus = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Revenue chart data (last 30 days)
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    
    const revenueChart = await Booking.aggregate([
      { $match: { createdAt: { $gte: last30Days }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Bookings chart data (last 30 days)
    const bookingsChart = await Booking.aggregate([
      { $match: { createdAt: { $gte: last30Days } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top performing chauffeurs
    const topChauffeurs = await Booking.aggregate([
      { $match: { status: 'completed', chauffeur: { $exists: true } } },
      {
        $group: {
          _id: '$chauffeur',
          rides: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
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
          name: { $concat: ['$chauffeur.firstName', ' ', '$chauffeur.lastName'] },
          email: '$chauffeur.email',
          rides: 1,
          revenue: 1,
        },
      },
    ]);

    // Recent new customers
    const newCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email createdAt');

    // Pending chauffeur applications (status pending)
    const pendingChauffeurs = await Chauffeur.countDocuments({ status: 'pending' });

    // Popular service types (Booking has rideType)
    const popularServices = await Booking.aggregate([
      { $match: { status: { $in: ['completed', 'confirmed', 'assigned', 'in-progress'] } } },
      { $group: { _id: '$rideType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalBookings,
          totalCustomers,
          totalChauffeurs,
          activeChauffeurs,
          activeGuests,
          activeBookings,
          pendingBookings,
          pendingChauffeurs,
          totalCommission: totalCommission[0]?.total || 0,
        },
        today: {
          bookings: todayBookings,
          revenue: todayRevenue[0]?.total || 0,
          revenueChange: yesterdayRevenue[0]?.total 
            ? (((todayRevenue[0]?.total || 0) - yesterdayRevenue[0].total) / yesterdayRevenue[0].total * 100).toFixed(2)
            : 0,
        },
        thisMonth: {
          bookings: monthBookings,
          revenue: monthRevenue[0]?.total || 0,
          revenueGrowth: parseFloat(revenueGrowth),
          bookingsGrowth: parseFloat(bookingsGrowth),
        },
        charts: {
          revenue: revenueChart,
          bookings: bookingsChart,
          bookingsByStatus,
        },
        topChauffeurs,
        recentBookings,
        newCustomers,
        popularServices,
      },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
