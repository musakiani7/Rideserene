const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Review comment cannot exceed 500 characters'],
  },
  categories: {
    professionalism: {
      type: Number,
      min: 1,
      max: 5,
    },
    punctuality: {
      type: Number,
      min: 1,
      max: 5,
    },
    vehicleCondition: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    drivingSkills: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  // Response from chauffeur
  chauffeurResponse: {
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Response cannot exceed 300 characters'],
    },
    respondedAt: {
      type: Date,
    },
  },
  // Admin moderation
  isVisible: {
    type: Boolean,
    default: true,
  },
  isFlagged: {
    type: Boolean,
    default: false,
  },
  flagReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
reviewSchema.index({ chauffeur: 1, createdAt: -1 });
reviewSchema.index({ customer: 1 });
reviewSchema.index({ booking: 1 });

// Update the chauffeur's rating when a review is added
reviewSchema.post('save', async function() {
  const Chauffeur = mongoose.model('Chauffeur');
  
  // Calculate average rating for this chauffeur
  const reviews = await this.constructor.find({ 
    chauffeur: this.chauffeur,
    isVisible: true 
  });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    await Chauffeur.findByIdAndUpdate(this.chauffeur, {
      rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
      totalRatings: reviews.length,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
