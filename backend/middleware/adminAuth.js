const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Protect admin routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin exists and is active
    req.admin = await Admin.findById(decoded.id);

    if (!req.admin || !req.admin.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Admin account not found or inactive',
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route',
    });
  }
};

// Check specific permissions
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin.permissions[permission] && req.admin.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
