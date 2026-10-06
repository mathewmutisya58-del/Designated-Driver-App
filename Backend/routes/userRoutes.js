const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// GET /api/users/profile - Protected endpoint to retrieve logged-in user details
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user
    }
  });
});

module.exports = router;