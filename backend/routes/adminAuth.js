const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe } = require('../controllers/adminAuthController');
const { protect } = require('../middleware/adminAuth');

const adminLoginValidation = [
  body('email')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', adminLoginValidation, login);
router.get('/me', protect, getMe);

module.exports = router;
