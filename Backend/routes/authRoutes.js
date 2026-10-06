const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser } = require('../controllers/authController');

// 1. Define the Rate Limiter Rule
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                  // Maximum 10 attempts per IP address
  message: { message: 'Too many authentication attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// 2. Attach rate limiter to login and register
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

module.exports = router;