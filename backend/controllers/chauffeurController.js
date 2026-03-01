const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Chauffeur = require('../models/Chauffeur');
const { sendPasswordResetEmail } = require('../utils/email');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id, role: 'chauffeur' }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register a new chauffeur (5-step form)
// @route   POST /api/chauffeur/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const {
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      country,
      city,
      password,
      confirmPassword,
      requirementsAccepted,
      profilePicture,
      driverLicense,
      chauffeurLicense,
      identityCard,
      vehicle,
      company,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !country || !city || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required personal information',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    if (!requirementsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must accept the requirements to proceed',
      });
    }

    // Validate vehicle information
    if (!vehicle || !vehicle.model || !vehicle.year || !vehicle.color || !vehicle.registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all vehicle information',
      });
    }

    // Validate vehicle year (only check that it's not in the future)
    const currentYear = new Date().getFullYear();
    if (vehicle.year > currentYear) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle year cannot be in the future',
      });
    }

    if (!driverLicense || !chauffeurLicense) {
      return res.status(400).json({
        success: false,
        message: 'Both driver license and chauffeur license (second license) are required. Both must be valid and active.',
      });
    }

    // Check if chauffeur already exists
    const existingChauffeur = await Chauffeur.findOne({ email });
    if (existingChauffeur) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Check if registration number already exists
    const existingVehicle = await Chauffeur.findOne({ 'vehicle.registrationNumber': vehicle.registrationNumber });
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle registration number already registered',
      });
    }

    // Create chauffeur
    const chauffeur = await Chauffeur.create({
      firstName,
      lastName,
      email,
      phone,
      countryCode,
      country,
      city,
      password,
      requirementsAccepted,
      profilePicture,
      driverLicense,
      chauffeurLicense,
      identityCard,
      vehicle: {
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color,
        registrationNumber: vehicle.registrationNumber,
        registrationCertificate: vehicle.registrationCertificate,
        insuranceCertificate: vehicle.insuranceCertificate,
        vehiclePhoto: vehicle.vehiclePhoto,
      },
      ...(company && {
        company: {
          commercialRegistration: company.commercialRegistration,
          fleetInsuranceAgreement: company.fleetInsuranceAgreement,
          vatRegistrationCertificate: company.vatRegistrationCertificate,
          operatingPermit: company.operatingPermit,
        },
      }),
      status: 'pending',
    });

    // Generate token
    const token = generateToken(chauffeur._id);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Your application is pending approval.',
      token,
      chauffeur: {
        id: chauffeur._id,
        firstName: chauffeur.firstName,
        lastName: chauffeur.lastName,
        email: chauffeur.email,
        phone: chauffeur.phone,
        country: chauffeur.country,
        city: chauffeur.city,
        status: chauffeur.status,
        isActive: chauffeur.isActive,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Login chauffeur
// @route   POST /api/chauffeur/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const emailNormalized = String(email).trim().toLowerCase();

    // Check if chauffeur exists
    const chauffeur = await Chauffeur.findOne({ email: emailNormalized }).select('+password');
    if (!chauffeur) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isPasswordMatch = await chauffeur.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if account is approved
    if (chauffeur.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your application is pending approval. Please wait for admin confirmation.',
      });
    }

    if (chauffeur.status === 'rejected') {
      return res.status(403).json({
        success: false,
        message: `Your application has been rejected. Reason: ${chauffeur.rejectionReason || 'Not specified'}`,
      });
    }

    if (chauffeur.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact support.',
      });
    }

    // Check if account is active
    if (!chauffeur.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.',
      });
    }

    // Update last login (direct update to avoid re-running full schema validation on save)
    await Chauffeur.updateOne(
      { _id: chauffeur._id },
      { $set: { lastLogin: new Date() } }
    );

    // Generate token
    const token = generateToken(chauffeur._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      chauffeur: {
        id: chauffeur._id,
        firstName: chauffeur.firstName,
        lastName: chauffeur.lastName,
        email: chauffeur.email,
        phone: chauffeur.phone,
        country: chauffeur.country,
        city: chauffeur.city,
        status: chauffeur.status,
        isActive: chauffeur.isActive,
        vehicle: chauffeur.vehicle,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// @desc    Forgot password – send reset link to chauffeur email
// @route   POST /api/chauffeur/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide your email address.' });
    }

    const chauffeur = await Chauffeur.findOne({ email: String(email).trim().toLowerCase() });
    if (!chauffeur) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, you will receive a password reset link shortly.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    chauffeur.resetPasswordToken = resetToken;
    chauffeur.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await chauffeur.save();

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/chauffeur-reset-password?token=${resetToken}`;
    await sendPasswordResetEmail({ to: chauffeur.email, resetUrl, isChauffeur: true });

    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
      console.log('📧 [DEV] Chauffeur password reset link:', resetUrl);
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link shortly.',
    });
  } catch (error) {
    console.error('Chauffeur forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing request. Please try again.',
    });
  }
};

// @desc    Reset password using token from email link
// @route   POST /api/chauffeur/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const chauffeur = await Chauffeur.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!chauffeur) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset link. Please request a new password reset.',
      });
    }

    chauffeur.password = newPassword;
    chauffeur.resetPasswordToken = undefined;
    chauffeur.resetPasswordExpires = undefined;
    await chauffeur.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Chauffeur reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password. Please try again.',
    });
  }
};

// @desc    Get chauffeur profile
// @route   GET /api/chauffeur/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.chauffeur.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.status(200).json({
      success: true,
      chauffeur: {
        id: chauffeur._id,
        firstName: chauffeur.firstName,
        lastName: chauffeur.lastName,
        email: chauffeur.email,
        phone: chauffeur.phone,
        countryCode: chauffeur.countryCode,
        country: chauffeur.country,
        city: chauffeur.city,
        profilePicture: chauffeur.profilePicture,
        driverLicense: chauffeur.driverLicense,
        chauffeurLicense: chauffeur.chauffeurLicense,
        identityCard: chauffeur.identityCard,
        vehicle: chauffeur.vehicle,
        company: chauffeur.company,
        status: chauffeur.status,
        isActive: chauffeur.isActive,
        isVerified: chauffeur.isVerified,
        isOnline: chauffeur.isOnline,
        rating: chauffeur.rating,
        totalRatings: chauffeur.totalRatings,
        createdAt: chauffeur.createdAt,
        approvedAt: chauffeur.approvedAt,
        rejectionReason: chauffeur.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
    });
  }
};

// @desc    Update chauffeur profile
// @route   PUT /api/chauffeur/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const chauffeur = await Chauffeur.findById(req.chauffeur.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    // Update fields
    if (firstName) chauffeur.firstName = firstName;
    if (lastName) chauffeur.lastName = lastName;
    if (phone) chauffeur.phone = phone;

    // Handle profile picture upload if file is provided
    if (req.file) {
      // Construct the file path relative to uploads directory
      chauffeur.profilePicture = req.file.path.replace(/\\/g, '/');
      console.log('Profile picture updated:', chauffeur.profilePicture);
    }

    await chauffeur.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      chauffeur: {
        id: chauffeur._id,
        firstName: chauffeur.firstName,
        lastName: chauffeur.lastName,
        email: chauffeur.email,
        phone: chauffeur.phone,
        profilePicture: chauffeur.profilePicture,
      },
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

// @desc    Get approved vehicles list
// @route   GET /api/chauffeur/approved-vehicles
// @access  Public
exports.getApprovedVehicles = async (req, res) => {
  try {
    const approvedVehicles = [
      'Ford Expedition', 'Mercedes-Benz Vito', 'Mercedes-Benz EQE', 'Land Rover Range Rover',
      'Mercedes-Benz GLE', 'Genesis G90', 'Mercedes-Benz E-Class', 'BMW 5 series', 'Audi A8',
      'Mercedes-Benz GLS', 'Cadillac Escalade', 'Chevrolet Tahoe', 'Chevrolet Suburban',
      'BMW 7 series', 'Mercedes-Benz EQV', 'BMW i7', 'Lucid Air', 'GMC Yukon XL', 'Audi A6',
      'Mercedes-Benz EQS', 'Mercedes-Benz S-Class', 'BMW i5', 'GMC Yukon Denali',
      'Mercedes-Benz V-Class'
    ];

    res.status(200).json({
      success: true,
      vehicles: approvedVehicles,
      colors: ['Black', 'Silver'],
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved vehicles',
    });
  }
};

// @desc    Get chauffeur status
// @route   GET /api/chauffeur/status
// @access  Private
exports.getStatus = async (req, res) => {
  try {
    const chauffeur = await Chauffeur.findById(req.chauffeur.id);

    if (!chauffeur) {
      return res.status(404).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    res.status(200).json({
      success: true,
      status: {
        applicationStatus: chauffeur.status,
        isActive: chauffeur.isActive,
        isVerified: chauffeur.isVerified,
        approvedAt: chauffeur.approvedAt,
        rejectionReason: chauffeur.rejectionReason,
      },
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching status',
    });
  }
};

// Middleware to protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');

    if (decoded.role !== 'chauffeur') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Chauffeur role required.',
      });
    }

    req.chauffeur = await Chauffeur.findById(decoded.id);

    if (!req.chauffeur) {
      return res.status(401).json({
        success: false,
        message: 'Chauffeur not found',
      });
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid token',
    });
  }
};
