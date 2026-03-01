const Chauffeur = require('../models/Chauffeur');
const Booking = require('../models/Booking');

// @desc    Get all chauffeurs
// @route   GET /api/admin/chauffeurs
// @access  Private (Admin)
exports.getAllChauffeurs = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const chauffeurs = await Chauffeur.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Chauffeur.countDocuments(query);

    // Get stats for each chauffeur
    const chauffeursWithStats = await Promise.all(
      chauffeurs.map(async (chauffeur) => {
        const completedRides = await Booking.countDocuments({ 
          chauffeur: chauffeur._id, 
          status: 'completed' 
        });
        const totalEarnings = await Booking.aggregate([
          { $match: { chauffeur: chauffeur._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);

        return {
          ...chauffeur.toObject(),
          completedRides,
          totalEarnings: totalEarnings[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: chauffeursWithStats,
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

// @desc    Get chauffeur by ID
// @route   GET /api/admin/chauffeurs/:id
// @access  Private (Admin)
exports.getChauffeurById = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.params.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    // Get chauffeur bookings
    const bookings = await Booking.find({ chauffeur: chauffeur._id })
      .populate('customer', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10);

    const completedRides = await Booking.countDocuments({ 
      chauffeur: chauffeur._id, 
      status: 'completed' 
    });
    
    const totalEarnings = await Booking.aggregate([
      { $match: { chauffeur: chauffeur._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        chauffeur,
        bookings,
        stats: {
          completedRides,
          totalEarnings: totalEarnings[0]?.total || 0,
        },
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

// @desc    Approve chauffeur
// @route   PUT /api/admin/chauffeurs/:id/approve
// @access  Private (Admin)
exports.approveChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.params.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    chauffeur.status = 'approved';
    chauffeur.isVerified = true;
    chauffeur.isActive = true;
    chauffeur.approvedAt = Date.now();
    await chauffeur.save();

    res.status(200).json({
      success: true,
      message: 'Chauffeur approved successfully',
      data: chauffeur,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Reject chauffeur
// @route   PUT /api/admin/chauffeurs/:id/reject
// @access  Private (Admin)
exports.rejectChauffeur = async (req, res) => {
  try {
    const { reason } = req.body;
    const chauffeur = await Chauffeur.findById(req.params.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    chauffeur.status = 'rejected';
    chauffeur.rejectionReason = reason;
    await chauffeur.save();

    res.status(200).json({
      success: true,
      message: 'Chauffeur rejected',
      data: chauffeur,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update chauffeur
// @route   PUT /api/admin/chauffeurs/:id
// @access  Private (Admin)
exports.updateChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur updated successfully',
      data: chauffeur,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete chauffeur
// @route   DELETE /api/admin/chauffeurs/:id
// @access  Private (Admin)
exports.deleteChauffeur = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findByIdAndDelete(req.params.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Chauffeur deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
