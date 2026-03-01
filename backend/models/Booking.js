const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  bookingReference: {
    type: String,
    unique: true,
    // Not required in schema because it's auto-generated in pre-save hook
  },
  // Trip Details
  rideType: {
    type: String,
    enum: ['one-way', 'by-hour', 'round-trip', 'hourly', 'city-to-city', 'airport-transfer'],
    required: true,
  },
  pickupLocation: {
    address: { type: String, required: true },
    placeId: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  dropoffLocation: {
    address: String,
    placeId: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  pickupDate: {
    type: Date,
    required: true,
  },
  pickupTime: {
    type: String,
    required: true,
  },
  duration: {
    type: Number, // in hours
  },
  estimatedDistance: {
    type: Number, // in km
  },
  estimatedArrivalTime: {
    type: String,
  },
  
  // Vehicle Details
  vehicleClass: {
    id: String,
    name: { type: String, required: true },
    vehicle: String,
    passengers: Number,
    luggage: Number,
    basePrice: Number,
  },
  
  // Passenger Details
  passengerInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    flightNumber: String,
    specialRequests: String,
  },
  
  // Pricing
  basePrice: {
    type: Number,
    required: true,
  },
  taxes: {
    type: Number,
    default: 0,
  },
  fees: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'USD',
  },
  
  // Payment Details
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'cash'],
  },
  paymentIntentId: String,
  transactionId: String,
  paidAt: Date,
  
  // Booking Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  
  // Chauffeur Assignment
  chauffeur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chauffeur',
  },
  assignedAt: Date,
  // Chauffeur ride request management (who declined this request)
  declinedByChauffeurs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chauffeur',
    },
  ],
  
  // Ride Progress Tracking
  startedAt: Date,
  completedAt: Date,
  actualEndTime: String,
  actualDropoffLocation: {
    address: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  
  // Additional Info
  notes: String,
  specialRequests: String,
  cancellationReason: String,
  cancelledAt: Date,
  
  // Invoice Details
  invoiceNumber: String,
  invoiceGeneratedAt: Date,
  additionalCharges: {
    type: Number,
    default: 0,
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

// Generate unique booking reference
bookingSchema.pre('save', async function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.bookingReference = `BK-${timestamp}-${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
bookingSchema.index({ customer: 1, createdAt: -1 });
// bookingReference already has unique: true, no need for separate index
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
