const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  updateDriverProfile,
  updateDriverLocation
} = require('../controllers/driverController');

// All driver routes require logged in driver
router.use(protect);
router.use(authorize('driver'));

router.put('/profile', updateDriverProfile);
router.patch('/location', updateDriverLocation);

module.exports = router;