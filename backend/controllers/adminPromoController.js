const PromoCode = require('../models/PromoCode');

// @desc    Get all promo codes
// @route   GET /api/admin/promos
// @access  Private (Admin)
exports.getAllPromoCodes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status === 'active') {
      query.isActive = true;
      query.expiryDate = { $gte: new Date() };
    } else if (status === 'expired') {
      query.expiryDate = { $lt: new Date() };
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const promoCodes = await PromoCode.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await PromoCode.countDocuments(query);

    res.status(200).json({
      success: true,
      data: promoCodes,
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

// @desc    Create promo code
// @route   POST /api/admin/promos
// @access  Private (Admin)
exports.createPromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Promo code created successfully',
      data: promoCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update promo code
// @route   PUT /api/admin/promos/:id
// @access  Private (Admin)
exports.updatePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code updated successfully',
      data: promoCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete promo code
// @route   DELETE /api/admin/promos/:id
// @access  Private (Admin)
exports.deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
