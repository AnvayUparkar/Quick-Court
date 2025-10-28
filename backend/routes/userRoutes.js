const express = require('express');
const { getUserProfile, updateUserProfile, getMyBookings } = require('../controllers/userController');
const upload = require('../utils/multer');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// User profile routes
router.get('/profile/details', protect, getUserProfile);
router.put('/profile/update', protect, upload.single('avatar'), updateUserProfile);
router.get('/bookings/list', protect, getMyBookings);

module.exports = router;
