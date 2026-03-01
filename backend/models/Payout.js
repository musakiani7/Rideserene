const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
    required: true,
    index: true,
  },
  
  // Payout Details
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  
  // Period Information
  periodStart: {
    type: Date,
    required: true,
  },
  periodEnd: {
    type: Date,
    required: true,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
    default: 'pending',
    index: true,
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe', 'cash', 'check'],
    required: true,
  },
  
  // Bank Details (if applicable)
  bankDetails: {
    accountHolderName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String,
  },
  
  // Transaction Details
  transactionId: String,
  transactionReference: String,
  
  // Rides Included in Payout
  rides: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  }],
  rideCount: {
    type: Number,
    default: 0,
  },
  
  // Deductions and Adjustments
  commission: {
    type: Number,
    default: 0,
    min: 0,
  },
  commissionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  deductions: {
    type: Number,
    default: 0,
  },
  bonuses: {
    type: Number,
    default: 0,
  },
  adjustments: {
    type: Number,
    default: 0,
  },
  
  // Calculated Amounts
  grossAmount: {
    type: Number,
    required: true,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  
  // Timing
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  processedAt: Date,
  completedAt: Date,
  failedAt: Date,
  
  // Notes and Reason
  notes: String,
  failureReason: String,
  
  // Processed By (Admin)
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
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

// Update timestamp on save
payoutSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
payoutSchema.index({ chauffeur: 1, status: 1 });
payoutSchema.index({ chauffeur: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ periodStart: 1, periodEnd: 1 });

module.exports = mongoose.model('Payout', payoutSchema);
