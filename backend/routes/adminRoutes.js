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

router.get('/dashboard', getDashboardStats);

// User management routes
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id', upload.single('avatar'), updateUser);
router.delete('/users/:id', deleteUser);
router.get('/users/:userId/bookings', getUserBookings);

// Facility management routes
router.get('/facilities/pending', getPendingFacilities);
router.put('/facilities/:id/approve', approveFacility);

module.exports = router;
