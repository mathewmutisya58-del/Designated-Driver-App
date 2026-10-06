const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  createDesignatedDriverRequest,
  getPendingRequests,
  acceptRide,
  updateRideStatus
} = require('../controllers/rideController');

router.use(protect); // All ride routes require authentication

// Customer creates request for a driver to operate their vehicle
router.post('/request', authorize('customer'), createDesignatedDriverRequest);

// Driver routes for accepting and progressing jobs
router.get('/pending', authorize('driver'), getPendingRequests);
router.patch('/:id/accept', authorize('driver'), acceptRide);
router.patch('/:id/status', authorize('driver'), updateRideStatus);

module.exports = router;