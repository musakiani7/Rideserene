const Customer = require('../models/Customer');
const Booking = require('../models/Booking');

// @desc    Get all customers
// @route   GET /api/admin/customers
// @access  Private (Admin)
exports.getAllCustomers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Customer.countDocuments(query);

    // Get booking counts for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const bookingCount = await Booking.countDocuments({ customer: customer._id });
        const totalSpent = await Booking.aggregate([
          { $match: { customer: customer._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$totalPrice' } } },
        ]);

        return {
          ...customer.toObject(),
          bookingCount,
          totalSpent: totalSpent[0]?.total || 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: customersWithStats,
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

// @desc    Get customer by ID
// @route   GET /api/admin/customers/:id
// @access  Private (Admin)
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Get customer bookings
    const bookings = await Booking.find({ customer: customer._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const bookingCount = await Booking.countDocuments({ customer: customer._id });
    const totalSpent = await Booking.aggregate([
      { $match: { customer: customer._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        customer,
        bookings,
        stats: {
          bookingCount,
          totalSpent: totalSpent[0]?.total || 0,
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

// @desc    Update customer
// @route   PUT /api/admin/customers/:id
// @access  Private (Admin)
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/admin/customers/:id
// @access  Private (Admin)
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Block customer
// @route   PUT /api/admin/customers/:id/block
// @access  Private (Admin)
exports.blockCustomer = async (req, res) => {
  try {
    const { reason } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.isBlocked = true;
    customer.blockReason = reason || 'Blocked by admin';
    customer.blockedAt = new Date();
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer blocked successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Unblock customer
// @route   PUT /api/admin/customers/:id/unblock
// @access  Private (Admin)
exports.unblockCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    customer.isBlocked = false;
    customer.blockReason = undefined;
    customer.blockedAt = undefined;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Customer unblocked successfully',
      data: customer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
