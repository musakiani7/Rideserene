const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const chauffeurSchema = new mongoose.Schema({
  // Personal Information (Step 3)
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  countryCode: {
    type: String,
    required: [true, 'Country code is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  
  // Personal Documents (Step 3)
  profilePicture: {
    type: String, // Base64 or file path
    required: [true, 'Profile picture is required'],
  },
  driverLicense: {
    type: String, // Base64 or file path
    required: [true, 'Driver license is required'],
  },
  chauffeurLicense: {
    type: String, // Base64 or file path - second license (e.g. TLC for NYC); both licenses must be valid and active
    required: [true, 'Chauffeur license (second license) is required'],
  },
  identityCard: {
    type: String, // Base64 or file path
    required: [true, 'Identity card is required'],
  },
  
  // Vehicle Information (Step 4)
  vehicle: {
    model: {
      type: String,
      required: [true, 'Vehicle model is required'],
    },
    year: {
      type: Number,
      required: [true, 'Vehicle year is required'],
      validate: {
        validator: function() {
          const currentYear = new Date().getFullYear();
          // Allow any year up to current year (no maximum age restriction)
          return this.vehicle.year <= currentYear;
        },
        message: 'Vehicle year cannot be in the future'
      }
    },
    color: {
      type: String,
      required: [true, 'Vehicle color is required'],
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },
    registrationCertificate: {
      type: String, // Base64 or file path
      required: [true, 'Registration certificate is required'],
    },
    insuranceCertificate: {
      type: String, // Base64 or file path
      required: [true, 'Insurance certificate is required'],
    },
    vehiclePhoto: {
      type: String, // Base64 or file path
      required: [true, 'Vehicle photo is required'],
    },
  },
  
  // Company Documents (optional – not required for registration)
  company: {
    commercialRegistration: { type: String },
    fleetInsuranceAgreement: { type: String },
    vatRegistrationCertificate: { type: String },
    operatingPermit: { type: String },
  },
  
  // Requirements Acceptance (Step 2)
  requirementsAccepted: {
    type: Boolean,
    required: [true, 'You must accept the requirements'],
    default: false,
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  
  // Rating
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  
  // Availability Schedule
  availability: {
    monday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    tuesday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    wednesday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    thursday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    friday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    saturday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    },
    sunday: {
      enabled: { type: Boolean, default: false },
      startTime: { type: String, default: '09:00' },
      endTime: { type: String, default: '17:00' }
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  approvedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
});

// Hash password before saving
chauffeurSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
chauffeurSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Chauffeur', chauffeurSchema);
