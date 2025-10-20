const express = require('express');
const router = express.Router();
const { 
    getFacilities, 
    getFacility, 
    createFacility, 
    updateFacility, 
    deleteFacility, 
    getOwnerFacilities 
} = require('../controllers/facilityController');
const { getDashboardStats } = require('../controllers/ownerController');
const { rateFacility } = require('../controllers/ratingController');
const { 
    addCourt, 
    getFacilityCourts, 
    getCourt, 
    updateCourt, 
    deleteCourt, 
    manageTimeSlots 
} = require('../controllers/courtController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../utils/multer'); // Assuming multer is configured for multiple files

// User can rate a facility
router.post('/:id/rate', protect, rateFacility);

// Public routes for facilities and courts
router.get('/', getFacilities);
router.get('/owner/:ownerId', protect, authorize('facility_owner', 'admin'), getOwnerFacilities); // New route to get facilities by owner

// Owner dashboard stats
router.get('/owner/:ownerId/dashboard-stats', protect, authorize('facility_owner', 'admin'), getDashboardStats);
router.get('/:id', getFacility);
router.get('/:facilityId/courts', getFacilityCourts);
router.get('/courts/:id', getCourt);

// Facility Owner routes
router.post('/', protect, authorize('facility_owner', 'admin'), upload.array('photos', 10), createFacility); // Allow up to 10 photos
router.put('/:id', protect, authorize('facility_owner', 'admin'), upload.array('photos', 10), updateFacility); // Allow up to 10 photos
router.delete('/:id', protect, authorize('facility_owner', 'admin'), deleteFacility);

// Mount Court Routes
router.use('/:facilityId/courts', require('./courtRoutes'));

module.exports = router;
