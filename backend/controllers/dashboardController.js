const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const SavedCard = require('../models/SavedCard');
const FavoriteLocation = require('../models/FavoriteLocation');
const PromoCode = require('../models/PromoCode');
const WalletTransaction = require('../models/WalletTransaction');
const Refund = require('../models/Refund');
const Review = require('../models/Review');
const SupportTicket = require('../models/SupportTicket');
const Faq = require('../models/Faq');
const mongoose = require('mongoose');
const Notification = require('../models/Notification');

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private
exports.getDashboardOverview = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Fetch customer first to ensure wallet is initialized
    const customer = await Customer.findById(customerId).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize wallet if it doesn't exist
    if (!customer.wallet) {
      customer.wallet = { balance: 0, currency: 'USD' };
      await customer.save();
    }

    // Fetch bookings data
    const [upcomingRides, rideHistory, totalCompletedRides] = await Promise.all([
      Booking.find({
        customer: customerId,
        status: { $in: ['pending', 'confirmed', 'assigned'] },
        pickupDate: { $gte: new Date() }
      })
        .sort({ pickupDate: 1 })
        .limit(5)
        .populate('chauffeur', 'firstName lastName phone email vehicle rating totalRatings'),
      
      Booking.find({
        customer: customerId,
        status: { $in: ['completed', 'cancelled'] }
      })
        .sort({ createdAt: -1 })
        .limit(10),
      
      Booking.countDocuments({ customer: customerId, status: 'completed' })
    ]);

    const stats = {
      totalRides: totalCompletedRides,
      upcomingRides: upcomingRides.length,
      walletBalance: customer.wallet.balance || 0,
    };

    console.log('Dashboard stats for customer', customerId, ':', stats);

    res.status(200).json({
      success: true,
      data: {
        stats,
        upcomingRides,
        recentRides: rideHistory.slice(0, 5),
        customer,
      },
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get upcoming rides
// @route   GET /api/dashboard/upcoming-rides
// @access  Private
exports.getUpcomingRides = async (req, res) => {
  try {
    // Get all scheduled rides regardless of date (pending, confirmed, assigned, in-progress)
    // This includes rides scheduled for today, future, and even past dates that are still active
    const rides = await Booking.find({
      customer: req.user.id,
      status: { $in: ['pending', 'confirmed', 'assigned', 'in-progress'] }
    })
      .sort({ pickupDate: 1, pickupTime: 1 })
      .populate('chauffeur', 'firstName lastName phone email vehicle rating totalRatings profilePicture');

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides,
    });
  } catch (error) {
    console.error('Get upcoming rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming rides',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get ride history
// @route   GET /api/dashboard/ride-history
// @access  Private
exports.getRideHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Optional filter by status

    // Build query
    const query = { customer: req.user.id };
    if (status) {
      query.status = status;
    }

    // Get all bookings for the user with full details for invoicing
    const rides = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('chauffeur', 'firstName lastName phone email vehicle rating')
      .populate('customer', 'firstName lastName email phone profileImage')
      .lean(); // Convert to plain JavaScript objects for better performance

    const total = await Booking.countDocuments(query);

    // Generate invoice numbers for completed rides if not already generated
    for (let ride of rides) {
      if (ride.status === 'completed' && !ride.invoiceNumber) {
        ride.invoiceNumber = `INV-${ride.bookingReference}`;
      }
    }

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rides,
    });
  } catch (error) {
    console.error('Get ride history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get completed bookings for invoice download (PDF)
// @route   GET /api/dashboard/invoices
// @access  Private
exports.getInvoices = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { customer: req.user.id, status: 'completed' };
    const rides = await Booking.find(query)
      .sort({ completedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('chauffeur', 'firstName lastName phone email vehicle rating totalRatings')
      .populate('customer', 'firstName lastName email phone profileImage')
      .lean();

    const total = await Booking.countDocuments(query);

    for (let ride of rides) {
      if (!ride.invoiceNumber) ride.invoiceNumber = `INV-${ride.bookingReference}`;
    }

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rides,
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single ride details for invoice
// @route   GET /api/dashboard/ride/:id
// @access  Private
exports.getRideDetails = async (req, res) => {
  try {
    const ride = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id // Ensure user can only access their own rides
    })
      .populate('chauffeur', 'firstName lastName phone email vehicle rating')
      .populate('customer', 'firstName lastName email phone profileImage')
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Generate invoice number if completed and not already generated
    if (ride.status === 'completed' && !ride.invoiceNumber) {
      ride.invoiceNumber = `INV-${ride.bookingReference}`;
      
      // Update the database
      await Booking.findByIdAndUpdate(req.params.id, {
        invoiceNumber: ride.invoiceNumber,
        invoiceGeneratedAt: new Date()
      });
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    console.error('Get ride details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ride details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get chauffeur & vehicle details for a ride (customer view)
// @route   GET /api/dashboard/ride/:id/chauffeur-details
// @access  Private
exports.getChauffeurDetailsForRide = async (req, res) => {
  try {
    const ride = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
    })
      .populate('chauffeur', 'firstName lastName phone email vehicle rating totalRatings profilePicture')
      .lean();

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found',
      });
    }

    if (!ride.chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'No chauffeur assigned to this ride yet',
      });
    }

    const ch = ride.chauffeur;
    const vehicle = ch.vehicle || {};

    res.status(200).json({
      success: true,
      data: {
        bookingReference: ride.bookingReference,
        pickupDate: ride.pickupDate,
        pickupTime: ride.pickupTime,
        status: ride.status,
        chauffeur: {
          firstName: ch.firstName,
          lastName: ch.lastName,
          fullName: [ch.firstName, ch.lastName].filter(Boolean).join(' '),
          phone: ch.phone,
          email: ch.email || null,
          rating: ch.rating != null ? ch.rating : null,
          totalRatings: ch.totalRatings || 0,
        },
        vehicle: {
          model: vehicle.model || '—',
          year: vehicle.year || '—',
          color: vehicle.color || '—',
          registrationNumber: vehicle.registrationNumber || '—',
        },
      },
    });
  } catch (error) {
    console.error('Get chauffeur details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chauffeur details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get saved payment methods
// @route   GET /api/dashboard/payment-methods
// @access  Private
exports.getPaymentMethods = async (req, res) => {
  try {
    const cards = await SavedCard.find({ customer: req.user.id }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: cards.length,
      data: cards,
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment methods',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add payment method
// @route   POST /api/dashboard/payment-methods
// @access  Private
exports.addPaymentMethod = async (req, res) => {
  try {
    const { stripePaymentMethodId, cardBrand, last4, expiryMonth, expiryYear, isDefault } = req.body;

    if (isDefault) {
      await SavedCard.updateMany(
        { customer: req.user.id },
        { isDefault: false }
      );
    }

    const card = await SavedCard.create({
      customer: req.user.id,
      stripePaymentMethodId,
      cardBrand,
      last4,
      expiryMonth,
      expiryYear,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added successfully',
      data: card,
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete payment method
// @route   DELETE /api/dashboard/payment-methods/:id
// @access  Private
exports.deletePaymentMethod = async (req, res) => {
  try {
    const card = await SavedCard.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Payment method not found'
      });
    }

    await card.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Payment method deleted successfully',
    });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting payment method',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get existing review for a ride (if any)
// @route   GET /api/dashboard/rides/:id/review
// @access  Private
exports.getRideReview = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).select('_id customer chauffeur status');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const review = await Review.findOne({
      booking: booking._id,
      customer: req.user.id,
    }).select('rating comment categories createdAt updatedAt');

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Get ride review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Add or update review for a ride
// @route   POST /api/dashboard/rides/:id/review
// @access  Private
exports.addOrUpdateRideReview = async (req, res) => {
  try {
    const { rating, comment, categories } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating between 1 and 5 is required',
      });
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).populate('chauffeur', '_id');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (!booking.chauffeur) {
      return res.status(400).json({
        success: false,
        message: 'This ride does not have an assigned chauffeur to review yet.',
      });
    }

    // Ensure chauffeur ID is properly extracted and converted to ObjectId
    let chauffeurId = booking.chauffeur._id || booking.chauffeur;
    
    // Convert to ObjectId if it's a string
    if (typeof chauffeurId === 'string' && mongoose.Types.ObjectId.isValid(chauffeurId)) {
      chauffeurId = new mongoose.Types.ObjectId(chauffeurId);
    }
    
    console.log('📝 [addOrUpdateRideReview] Creating/updating review');
    console.log('📝 [addOrUpdateRideReview] Booking ID:', booking._id);
    console.log('📝 [addOrUpdateRideReview] Customer ID:', req.user.id);
    console.log('📝 [addOrUpdateRideReview] Chauffeur ID:', chauffeurId);
    console.log('📝 [addOrUpdateRideReview] Chauffeur ID type:', typeof chauffeurId);
    console.log('📝 [addOrUpdateRideReview] Rating:', rating);
    console.log('📝 [addOrUpdateRideReview] Comment:', comment);
    console.log('📝 [addOrUpdateRideReview] Categories:', categories);

    let review = await Review.findOne({
      booking: booking._id,
      customer: req.user.id,
    });

    // Prepare categories object if provided
    const categoriesData = categories ? {
      professionalism: categories.professionalism || undefined,
      punctuality: categories.punctuality || undefined,
      vehicleCondition: categories.vehicleCondition || undefined,
      communication: categories.communication || undefined,
      drivingSkills: categories.drivingSkills || undefined,
    } : {};

    if (review) {
      console.log('📝 [addOrUpdateRideReview] Updating existing review:', review._id);
      review.rating = rating;
      review.comment = comment || '';
      review.chauffeur = chauffeurId; // Ensure chauffeur is set correctly
      if (categories) {
        review.categories = categoriesData;
      }
      review.updatedAt = new Date();
      await review.save();
      console.log('📝 [addOrUpdateRideReview] Review updated successfully');
    } else {
      console.log('📝 [addOrUpdateRideReview] Creating new review');
      review = await Review.create({
        booking: booking._id,
        customer: req.user.id,
        chauffeur: chauffeurId,
        rating,
        comment: comment || '',
        categories: categoriesData,
      });
      console.log('📝 [addOrUpdateRideReview] Review created successfully:', review._id);
    }
    
    // Verify the review was saved correctly
    const savedReview = await Review.findById(review._id).populate('chauffeur', '_id firstName lastName');
    console.log('📝 [addOrUpdateRideReview] Saved review chauffeur ID:', savedReview.chauffeur?._id || savedReview.chauffeur);

    res.status(200).json({
      success: true,
      message: 'Review saved successfully',
      review: {
        id: review._id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  } catch (error) {
    console.error('Add/update ride review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving review',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- Support (Contact Support Form) ----------
// @desc    Create support ticket
// @route   POST /api/dashboard/support
// @access  Private
exports.createSupportTicket = async (req, res) => {
  try {
    const { subject, description, category, bookingId } = req.body;
    if (!subject || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Subject, description and category are required',
      });
    }
    const allowedCategories = ['booking_issue', 'payment_issue', 'chauffeur_complaint', 'refund_request', 'general_inquiry', 'technical_issue'];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
      });
    }
    const ticketNumber = 'TKT-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    const ticket = await SupportTicket.create({
      ticketNumber,
      customer: req.user.id,
      booking: bookingId || undefined,
      subject: subject.trim(),
      description: description.trim(),
      category,
      priority: 'medium',
      status: 'open',
      messages: [{ sender: 'customer', message: description.trim() }],
    });
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket,
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get my support tickets
// @route   GET /api/dashboard/support
// @access  Private
exports.getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('booking', 'bookingReference pickupDate pickupLocation');
    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get single support ticket (customer's own)
// @route   GET /api/dashboard/support/:id
// @access  Private
exports.getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).populate('booking', 'bookingReference pickupDate pickupLocation');
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
    console.error('Get support ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Add message to support ticket (customer reply)
// @route   POST /api/dashboard/support/:id/messages
// @access  Private
exports.addSupportTicketMessage = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }
    const ticket = await SupportTicket.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }
    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add message to closed ticket',
      });
    }
    ticket.messages.push({ sender: 'customer', message: message.trim() });
    await ticket.save();
    res.status(200).json({
      success: true,
      message: 'Message sent',
      data: ticket,
    });
  } catch (error) {
    console.error('Add support message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- FAQ (Booking Help) ----------
// @desc    Get FAQ list
// @route   GET /api/dashboard/faq
// @access  Private
exports.getFaq = async (req, res) => {
  try {
    const faqs = await Faq.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.status(200).json({
      success: true,
      count: faqs.length,
      data: faqs,
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching FAQ',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ---------- In-app Notifications (dashboard list) ----------
// @desc    Get notifications for logged-in customer
// @route   GET /api/dashboard/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { customer: req.user.id };
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      data: notifications,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Mark a single notification as read
// @route   PUT /api/dashboard/notifications/:id/read
// @access  Private
exports.markNotificationRead = async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notif) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      data: notif,
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/dashboard/notifications/read-all
// @access  Private
exports.markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { customer: req.user.id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notifications',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Get favorite locations
// @route   GET /api/dashboard/favorite-locations
// @access  Private
exports.getFavoriteLocations = async (req, res) => {
  try {
    const locations = await FavoriteLocation.find({ customer: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations,
    });
  } catch (error) {
    console.error('Get favorite locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorite locations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add favorite location (saved address: Home, Office, Airport, Other)
// @route   POST /api/dashboard/favorite-locations
// @access  Private
exports.addFavoriteLocation = async (req, res) => {
  try {
    const { label, address, type, country, city, placeId, coordinates } = req.body;

    if (!address && !(country && city)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide address or both country and city',
      });
    }

    const location = await FavoriteLocation.create({
      customer: req.user.id,
      label: label || (type === 'home' ? 'Home' : type === 'work' ? 'Office' : type === 'airport' ? 'Airport' : 'Other'),
      address: address || [city, country].filter(Boolean).join(', '),
      type: ['home', 'work', 'airport', 'other'].includes(type) ? type : 'other',
      country: country || '',
      city: city || '',
      placeId: placeId || undefined,
      coordinates: coordinates && (coordinates.lat != null && coordinates.lng != null) ? coordinates : undefined,
    });

    res.status(201).json({
      success: true,
      message: 'Saved address added successfully',
      data: location,
    });
  } catch (error) {
    console.error('Add favorite location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding saved address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update favorite location (saved address)
// @route   PUT /api/dashboard/favorite-locations/:id
// @access  Private
exports.updateFavoriteLocation = async (req, res) => {
  try {
    const { label, address, type, country, city, placeId, coordinates } = req.body;

    const location = await FavoriteLocation.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Saved address not found',
      });
    }

    if (label !== undefined) location.label = label;
    if (address !== undefined) location.address = address;
    if (type !== undefined && ['home', 'work', 'airport', 'other'].includes(type)) location.type = type;
    if (country !== undefined) location.country = country;
    if (city !== undefined) location.city = city;
    if (placeId !== undefined) location.placeId = placeId;
    if (coordinates !== undefined && coordinates.lat != null && coordinates.lng != null) location.coordinates = coordinates;

    if (location.address === '' && location.city && location.country) {
      location.address = [location.city, location.country].filter(Boolean).join(', ');
    }

    await location.save();

    res.status(200).json({
      success: true,
      message: 'Saved address updated successfully',
      data: location,
    });
  } catch (error) {
    console.error('Update favorite location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating saved address',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete favorite location
// @route   DELETE /api/dashboard/favorite-locations/:id
// @access  Private
exports.deleteFavoriteLocation = async (req, res) => {
  try {
    const location = await FavoriteLocation.findOne({
      _id: req.params.id,
      customer: req.user.id
    });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: 'Favorite location not found'
      });
    }

    await location.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Favorite location deleted successfully',
    });
  } catch (error) {
    console.error('Delete favorite location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting favorite location',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get available promo codes
// @route   GET /api/dashboard/promo-codes
// @access  Private
exports.getAvailablePromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      $or: [
        { usageLimit: { $exists: false } },
        { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
      ]
    }).select('code description discountType discountValue maxDiscount minAmount validUntil');

    res.status(200).json({
      success: true,
      data: promoCodes
    });
  } catch (error) {
    console.error('Get promo codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching promo codes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Validate promo code
// @route   POST /api/dashboard/validate-promo
// @access  Private
exports.validatePromoCode = async (req, res) => {
  try {
    const { code, amount } = req.body;

    const promo = await PromoCode.findOne({
      code: code.toUpperCase(),
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired promo code'
      });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Promo code usage limit reached'
      });
    }

    if (amount < promo.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount of $${promo.minAmount} required`
      });
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = (amount * promo.discountValue) / 100;
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promo.discountValue;
    }

    res.status(200).json({
      success: true,
      data: {
        code: promo.code,
        description: promo.description,
        discount: discount.toFixed(2),
        finalAmount: (amount - discount).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Validate promo code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promo code',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update customer profile
// @route   PUT /api/dashboard/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, preferences, profileImage } = req.body;

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (phone) customer.phone = phone;
    if (profileImage) customer.profileImage = profileImage;
    if (preferences) {
      customer.preferences = {
        ...customer.preferences,
        ...preferences
      };
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: customer,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change password
// @route   PUT /api/dashboard/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get customer with password field
    const customer = await Customer.findById(req.user.id).select('+password');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify current password
    const isPasswordMatch = await customer.comparePassword(currentPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Check if new password is same as current
    const isSamePassword = await customer.comparePassword(newPassword);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    // Update password (will be hashed by pre-save middleware)
    customer.password = newPassword;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Add money to wallet
// @route   POST /api/dashboard/wallet/add-money
// @access  Private
exports.addMoneyToWallet = async (req, res) => {
  try {
    const { amount, paymentMethod, referenceId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const customer = await Customer.findById(req.user.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize wallet if it doesn't exist
    if (!customer.wallet) {
      customer.wallet = { balance: 0, currency: 'USD' };
    }

    const balanceBefore = customer.wallet.balance;
    const balanceAfter = balanceBefore + amount;

    // Create wallet transaction
    const transaction = await WalletTransaction.create({
      customer: req.user.id,
      type: 'credit',
      amount,
      balanceBefore,
      balanceAfter,
      description: `Added $${amount} to wallet`,
      transactionType: 'add_money',
      paymentMethod: paymentMethod || 'card',
      referenceId,
      status: 'completed'
    });

    // Update customer wallet balance
    customer.wallet.balance = balanceAfter;
    await customer.save();

    res.status(200).json({
      success: true,
      message: 'Money added to wallet successfully',
      data: {
        transaction,
        newBalance: balanceAfter
      }
    });
  } catch (error) {
    console.error('Add money to wallet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding money to wallet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get wallet transactions
// @route   GET /api/dashboard/wallet/transactions
// @access  Private
exports.getWalletTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await WalletTransaction.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await WalletTransaction.countDocuments({ customer: req.user.id });

    res.status(200).json({
      success: true,
      count: transactions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: transactions
    });
  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get wallet balance
// @route   GET /api/dashboard/wallet/balance
// @access  Private
exports.getWalletBalance = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).select('wallet');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Initialize wallet if it doesn't exist
    if (!customer.wallet) {
      customer.wallet = { balance: 0, currency: 'USD' };
      await customer.save();
    }

    res.status(200).json({
      success: true,
      data: {
        balance: customer.wallet.balance,
        currency: customer.wallet.currency
      }
    });
  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wallet balance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get refunds
// @route   GET /api/dashboard/refunds
// @access  Private
exports.getRefunds = async (req, res) => {
  try {
    const customerId = req.user.id;

    const refunds = await Refund.find({ customer: customerId })
      .populate('booking', 'bookingReference rideType pickupLocation dropoffLocation totalPrice status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: refunds.length,
      data: refunds
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching refunds',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get eligible bookings for refund
// @route   GET /api/dashboard/eligible-refund-bookings
// @access  Private
exports.getEligibleRefundBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get bookings that are cancelled or completed and don't have a refund yet
    const refundedBookingIds = await Refund.distinct('booking', { customer: customerId });

    const eligibleBookings = await Booking.find({
      customer: customerId,
      status: { $in: ['cancelled', 'completed'] },
      _id: { $nin: refundedBookingIds },
      totalPrice: { $gt: 0 }
    })
      .select('bookingReference rideType pickupLocation dropoffLocation totalPrice pickupDate status')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: eligibleBookings.length,
      data: eligibleBookings
    });
  } catch (error) {
    console.error('Get eligible refund bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching eligible bookings',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Request refund
// @route   POST /api/dashboard/request-refund
// @access  Private
exports.requestRefund = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId, reason, refundMethod, additionalDetails } = req.body;

    // Validate booking
    const booking = await Booking.findOne({
      _id: bookingId,
      customer: customerId
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking is eligible for refund
    if (!['cancelled', 'completed'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only cancelled or completed bookings are eligible for refund'
      });
    }

    // Check if refund already exists
    const existingRefund = await Refund.findOne({
      booking: bookingId,
      customer: customerId
    });

    if (existingRefund) {
      return res.status(400).json({
        success: false,
        message: 'A refund request already exists for this booking'
      });
    }

    // Create refund request
    const refund = await Refund.create({
      customer: customerId,
      booking: bookingId,
      amount: booking.totalPrice,
      reason: reason || 'booking_cancellation',
      refundMethod: refundMethod || 'wallet',
      notes: additionalDetails,
      status: 'pending',
      requestedAt: new Date()
    });

    await refund.populate('booking', 'bookingReference rideType pickupLocation dropoffLocation totalPrice');

    res.status(201).json({
      success: true,
      message: 'Refund request submitted successfully',
      data: refund
    });
  } catch (error) {
    console.error('Request refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting refund request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
