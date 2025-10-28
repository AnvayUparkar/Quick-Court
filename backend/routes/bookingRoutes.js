const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/create', protect, authorize('user'), bookingController.createBooking);
router.get('/my-bookings', protect, authorize('user'), bookingController.getMyBookings);

// Admin and Facility Owner routes
router.get('/all', protect, authorize('admin', 'facility_owner'), bookingController.getAllBookings);
router.get('/owner-bookings', protect, authorize('facility_owner'), bookingController.getOwnerBookings);
router.put('/cancel/:id', protect, authorize('user', 'admin', 'facility_owner'), bookingController.cancelBooking);

module.exports = router;