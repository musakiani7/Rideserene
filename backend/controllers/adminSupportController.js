const SupportTicket = require('../models/SupportTicket');
const Refund = require('../models/Refund');
const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const WalletTransaction = require('../models/WalletTransaction');

// @desc    Get all support tickets
// @route   GET /api/admin/support/tickets
// @access  Private (Admin)
exports.getAllTickets = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const tickets = await SupportTicket.find(query)
      .populate('customer', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await SupportTicket.countDocuments(query);

    res.status(200).json({
      success: true,
      data: tickets,
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

// @desc    Get ticket by ID
// @route   GET /api/admin/support/tickets/:id
// @access  Private (Admin)
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone')
      .populate('assignedTo', 'firstName lastName email')
      .populate('booking');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update ticket status
// @route   PUT /api/admin/support/tickets/:id/status
// @access  Private (Admin)
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    ticket.status = status;
    if (status === 'resolved' || status === 'closed') {
      ticket.resolvedAt = Date.now();
    }
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Assign ticket to admin
// @route   PUT /api/admin/support/tickets/:id/assign
// @access  Private (Admin)
exports.assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    ticket.assignedTo = adminId;
    ticket.status = 'in_progress';
    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Add message to ticket
// @route   POST /api/admin/support/tickets/:id/messages
// @access  Private (Admin)
exports.addMessage = async (req, res) => {
  try {
    const { message } = req.body;

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }

    ticket.messages.push({
      sender: 'admin',
      message,
      timestamp: Date.now(),
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      data: ticket,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// ==================== REFUND MANAGEMENT ====================

// @desc    Get all refund requests
// @route   GET /api/admin/support/refunds
// @access  Private (Admin)
exports.getAllRefunds = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};

    if (status) query.status = status;

    const refunds = await Refund.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('booking', 'bookingReference rideType pickupLocation dropoffLocation pickupDateTime totalPrice status')
      .populate('processedBy', 'firstName lastName')
      .sort({ requestedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Apply search filter after population
    let filteredRefunds = refunds;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredRefunds = refunds.filter(refund => {
        const customerName = `${refund.customer?.firstName} ${refund.customer?.lastName}`.toLowerCase();
        const email = refund.customer?.email?.toLowerCase() || '';
        const bookingRef = refund.booking?.bookingReference?.toLowerCase() || '';
        return customerName.includes(searchLower) || 
               email.includes(searchLower) || 
               bookingRef.includes(searchLower);
      });
    }

    const count = await Refund.countDocuments(query);

    // Calculate statistics
    const stats = {
      total: count,
      pending: await Refund.countDocuments({ status: 'pending' }),
      processing: await Refund.countDocuments({ status: 'processing' }),
      completed: await Refund.countDocuments({ status: 'completed' }),
      rejected: await Refund.countDocuments({ status: 'rejected' }),
      totalAmount: await Refund.aggregate([
        { $match: { status: { $in: ['pending', 'processing', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.status(200).json({
      success: true,
      data: filteredRefunds,
      stats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: filteredRefunds.length,
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Get refund by ID
// @route   GET /api/admin/support/refunds/:id
// @access  Private (Admin)
exports.getRefundById = async (req, res) => {
  try {
    const refund = await Refund.findById(req.params.id)
      .populate('customer', 'firstName lastName email phone wallet')
      .populate('booking')
      .populate('processedBy', 'firstName lastName email');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: refund,
    });
  } catch (error) {
    console.error('Get refund by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Approve refund request
// @route   PUT /api/admin/support/refunds/:id/approve
// @access  Private (Admin)
exports.approveRefund = async (req, res) => {
  try {
    const { notes } = req.body;
    const adminId = req.admin._id;

    console.log('Approving refund:', req.params.id, 'by admin:', adminId);

    const refund = await Refund.findById(req.params.id)
      .populate('customer', 'firstName lastName email wallet')
      .populate('booking', 'bookingReference totalPrice');

    if (!refund) {
      console.log('Refund not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    console.log('Refund found:', refund._id, 'Status:', refund.status);

    if (refund.status !== 'pending' && refund.status !== 'processing') {
      console.log('Invalid status for approval:', refund.status);
      return res.status(400).json({
        success: false,
        message: 'Only pending or processing refunds can be approved',
      });
    }

    // Update refund status
    refund.status = 'completed';
    refund.processedAt = new Date();
    refund.processedBy = adminId;
    if (notes) refund.notes = notes;

    // Add refund amount to customer wallet
    if (refund.refundMethod === 'wallet') {
      console.log('Adding to customer wallet:', refund.customer._id);
      const customer = await Customer.findById(refund.customer._id);
      
      if (!customer) {
        console.log('Customer not found:', refund.customer._id);
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // Initialize wallet if it doesn't exist
      if (!customer.wallet) {
        customer.wallet = { balance: 0, transactions: [] };
      }

      const balanceBefore = customer.wallet.balance || 0;
      const balanceAfter = balanceBefore + refund.amount;
      customer.wallet.balance = balanceAfter;
      
      console.log('Updating wallet balance from', balanceBefore, 'to', balanceAfter);
      await customer.save();

      // Create wallet transaction record
      await WalletTransaction.create({
        customer: customer._id,
        type: 'credit',
        amount: refund.amount,
        balanceBefore: balanceBefore,
        balanceAfter: balanceAfter,
        description: `Refund for booking ${refund.booking?.bookingReference || 'N/A'}`,
        transactionType: 'refund',
        referenceId: refund.booking?._id?.toString() || refund._id.toString(),
        status: 'completed'
      });
      
      console.log('Wallet transaction created');
    }

    await refund.save();
    console.log('Refund approved successfully:', refund._id);

    res.status(200).json({
      success: true,
      message: 'Refund approved successfully',
      data: refund,
    });
  } catch (error) {
    console.error('Approve refund error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      error: error.message,
    });
  }
};

// @desc    Reject refund request
// @route   PUT /api/admin/support/refunds/:id/reject
// @access  Private (Admin)
exports.rejectRefund = async (req, res) => {
  try {
    const { reason } = req.body;
    const adminId = req.admin._id;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const refund = await Refund.findById(req.params.id)
      .populate('customer', 'firstName lastName email')
      .populate('booking', 'bookingReference');

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    if (refund.status !== 'pending' && refund.status !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Only pending or processing refunds can be rejected',
      });
    }

    // Update refund status
    refund.status = 'rejected';
    refund.processedAt = new Date();
    refund.processedBy = adminId;
    refund.notes = reason;

    await refund.save();

    res.status(200).json({
      success: true,
      message: 'Refund rejected successfully',
      data: refund,
    });
  } catch (error) {
    console.error('Reject refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// @desc    Update refund status to processing
// @route   PUT /api/admin/support/refunds/:id/process
// @access  Private (Admin)
exports.processRefund = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const refund = await Refund.findById(req.params.id);

    if (!refund) {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found',
      });
    }

    if (refund.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending refunds can be marked as processing',
      });
    }

    refund.status = 'processing';
    refund.processedBy = adminId;
    await refund.save();

    res.status(200).json({
      success: true,
      message: 'Refund marked as processing',
      data: refund,
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
