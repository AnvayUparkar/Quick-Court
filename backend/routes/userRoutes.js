const express = require('express');
const { getUserProfile, updateUserProfile, getMyBookings } = require('../controllers/userController');
const upload = require('../utils/multer');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('avatar'), updateUserProfile);
router.get('/my-bookings', protect, getMyBookings);

module.exports = router;
