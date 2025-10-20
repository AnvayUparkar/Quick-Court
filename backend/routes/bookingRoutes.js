const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protect, authorize('user'), bookingController.createBooking); // Re-added authorize('user')
router.get('/my-bookings', protect, authorize('user'), bookingController.getMyBookings);

// Admin and Facility Owner routes
router.get('/', protect, authorize('admin', 'facility_owner'), bookingController.getAllBookings);
router.get('/owner', protect, authorize('facility_owner'), bookingController.getOwnerBookings); // New route for facility owner bookings
router.put('/:id/cancel', protect, authorize('user', 'admin', 'facility_owner'), bookingController.cancelBooking);

module.exports = router;