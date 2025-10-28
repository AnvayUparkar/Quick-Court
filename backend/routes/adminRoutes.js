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
router.get('/users/list', getUsers);
router.get('/users/details/:id', getUser);
router.put('/users/update/:id', upload.single('avatar'), updateUser);
router.delete('/users/remove/:id', deleteUser);
router.get('/users/bookings/:userId', getUserBookings);

// Facility management routes
router.get('/facilities/pending/list', getPendingFacilities);
router.put('/facilities/approve/:id', approveFacility);

module.exports = router;
