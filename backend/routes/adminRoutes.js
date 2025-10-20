const express = require('express');
const { 
    getDashboardStats, 
    getUsers, 
    getUser, 
    updateUser, 
    deleteUser, 
    getPendingFacilities, 
    approveFacility,
    getUserBookings // Import getUserBookings from adminController
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/multer'); // Import multer upload utility

const router = express.Router();

// All admin routes are protected and require 'admin' role
router.use(protect, authorize('admin'));

router.get('/dashboard-stats', getDashboardStats);
router.route('/users').get(getUsers);
router.route('/users/:id')
    .get(getUser)
    .put(upload.single('avatar'), updateUser) // Add multer middleware for avatar upload
    .delete(deleteUser);

router.get('/users/:userId/bookings', getUserBookings); // New route for admin to view user bookings

router.get('/facilities/pending', getPendingFacilities);
router.put('/facilities/:id/approve', approveFacility);

module.exports = router;
