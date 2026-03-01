const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Chauffeur = require('../models/Chauffeur');
const Customer = require('../models/Customer');
const mongoose = require('mongoose');

// @desc    Get all reviews for a chauffeur
// @route   GET /api/chauffeur/reviews
// @access  Private (Chauffeur)
exports.getChauffeurReviews = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id || req.chauffeur._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    console.log('⭐ [getChauffeurReviews] Fetching reviews for chauffeur ID:', chauffeurId);
    console.log('⭐ [getChauffeurReviews] Page:', page, 'Limit:', limit);

    // Calculate statistics - ensure ObjectId conversion first
    const chauffeurObjectId = mongoose.Types.ObjectId.isValid(chauffeurId) 
      ? new mongoose.Types.ObjectId(chauffeurId)
      : chauffeurId;

    // Get reviews with customer details - use ObjectId for consistency
    const reviews = await Review.find({ 
      chauffeur: chauffeurObjectId,
      isVisible: true 
    })
      .populate('customer', 'firstName lastName profilePicture')
      .populate('booking', 'bookingReference pickupDate rideType')
      .populate('chauffeur', '_id firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    console.log('⭐ [getChauffeurReviews] Found', reviews.length, 'reviews');
    if (reviews.length > 0) {
      console.log('⭐ [getChauffeurReviews] First review chauffeur ID:', reviews[0].chauffeur?._id || reviews[0].chauffeur);
      console.log('⭐ [getChauffeurReviews] First review booking:', reviews[0].booking?.bookingReference);
      console.log('⭐ [getChauffeurReviews] First review customer:', reviews[0].customer?.firstName, reviews[0].customer?.lastName);
    } else {
      // Debug: Check if there are any reviews for this chauffeur (including invisible ones)
      const allReviewsCount = await Review.countDocuments({ chauffeur: chauffeurObjectId });
      console.log('⭐ [getChauffeurReviews] Total reviews (including invisible):', allReviewsCount);
      if (allReviewsCount > 0) {
        const sampleReview = await Review.findOne({ chauffeur: chauffeurObjectId }).populate('chauffeur', '_id');
        console.log('⭐ [getChauffeurReviews] Sample review chauffeur ID:', sampleReview?.chauffeur?._id || sampleReview?.chauffeur);
        console.log('⭐ [getChauffeurReviews] Sample review isVisible:', sampleReview?.isVisible);
      }
    }

    // Calculate customer ratings (based on completed rides with this chauffeur)
    const reviewsWithCustomerRatings = await Promise.all(reviews.map(async (review) => {
      const customerId = review.customer?._id || review.customer;
      
      if (!customerId) {
        return {
          ...review.toObject(),
          customerRating: 0,
          customerRidesCount: 0
        };
      }
      
      // Count completed rides for this customer with this chauffeur
      const completedRides = await Booking.countDocuments({
        customer: customerId,
        chauffeur: chauffeurId,
        status: 'completed'
      });

      // Calculate customer rating based on completed rides (simple logic: more rides = better rating)
      // You can adjust this logic based on your business requirements
      let customerRating = 0;
      if (completedRides >= 10) customerRating = 5.0;
      else if (completedRides >= 5) customerRating = 4.5;
      else if (completedRides >= 3) customerRating = 4.0;
      else if (completedRides >= 1) customerRating = 3.5;
      
      return {
        ...review.toObject(),
        customerRating: customerRating,
        customerRidesCount: completedRides
      };
    }));

    // Count total reviews using ObjectId
    const totalReviews = await Review.countDocuments({ 
      chauffeur: chauffeurObjectId,
      isVisible: true 
    });
    
    console.log('⭐ [getChauffeurReviews] Total reviews found:', totalReviews);
    
    const stats = await Review.aggregate([
      { 
        $match: { 
          chauffeur: chauffeurObjectId,
          isVisible: true 
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          avgProfessionalism: { $avg: '$categories.professionalism' },
          avgPunctuality: { $avg: '$categories.punctuality' },
          avgVehicleCondition: { $avg: '$categories.vehicleCondition' },
          avgCommunication: { $avg: '$categories.communication' },
          avgDrivingSkills: { $avg: '$categories.drivingSkills' },
          totalReviews: { $sum: 1 },
          fiveStars: {
            $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] }
          },
          fourStars: {
            $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] }
          },
          threeStars: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
          },
          twoStars: {
            $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] }
          },
          oneStar: {
            $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] }
          },
        }
      }
    ]);

    res.status(200).json({
      success: true,
      reviews: reviewsWithCustomerRatings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasMore: skip + reviews.length < totalReviews,
      },
      statistics: stats.length > 0 ? {
        avgRating: Math.round(stats[0].avgRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
        categories: {
          professionalism: Math.round(stats[0].avgProfessionalism * 10) / 10,
          punctuality: Math.round(stats[0].avgPunctuality * 10) / 10,
          vehicleCondition: Math.round(stats[0].avgVehicleCondition * 10) / 10,
          communication: Math.round(stats[0].avgCommunication * 10) / 10,
          drivingSkills: Math.round(stats[0].avgDrivingSkills * 10) / 10,
        },
        distribution: {
          fiveStars: stats[0].fiveStars,
          fourStars: stats[0].fourStars,
          threeStars: stats[0].threeStars,
          twoStars: stats[0].twoStars,
          oneStar: stats[0].oneStar,
        }
      } : {
        avgRating: 0,
        totalReviews: 0,
        categories: {
          professionalism: 0,
          punctuality: 0,
          vehicleCondition: 0,
          communication: 0,
          drivingSkills: 0,
        },
        distribution: {
          fiveStars: 0,
          fourStars: 0,
          threeStars: 0,
          twoStars: 0,
          oneStar: 0,
        }
      },
    });
  } catch (error) {
    console.error('Get chauffeur reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message,
    });
  }
};

// @desc    Respond to a review
// @route   POST /api/chauffeur/reviews/:reviewId/respond
// @access  Private (Chauffeur)
exports.respondToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;
    const chauffeurId = req.chauffeur.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response message is required',
      });
    }

    const review = await Review.findOne({
      _id: reviewId,
      chauffeur: chauffeurId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    review.chauffeurResponse = {
      message: message.trim(),
      respondedAt: new Date(),
    };
    review.updatedAt = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Response posted successfully',
      review,
    });
  } catch (error) {
    console.error('Respond to review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error posting response',
      error: error.message,
    });
  }
};

// @desc    Get review statistics summary
// @route   GET /api/chauffeur/reviews/statistics
// @access  Private (Chauffeur)
exports.getReviewStatistics = async (req, res) => {
  try {
    const chauffeurId = req.chauffeur.id;

    const stats = await Review.aggregate([
      { 
        $match: { 
          chauffeur: require('mongoose').Types.ObjectId(chauffeurId),
          isVisible: true 
        } 
      },
      {
        $facet: {
          overall: [
            {
              $group: {
                _id: null,
                avgRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
              }
            }
          ],
          monthly: [
            {
              $group: {
                _id: {
                  month: { $month: '$createdAt' },
                  year: { $year: '$createdAt' }
                },
                avgRating: { $avg: '$rating' },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 6 }
          ],
          recent: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'customers',
                localField: 'customer',
                foreignField: '_id',
                as: 'customerInfo'
              }
            }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      statistics: stats[0],
    });
  } catch (error) {
    console.error('Get review statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error.message,
    });
  }
};

module.exports = exports;
