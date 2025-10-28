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

// Public routes
router.get('/', getFacilities);
router.get('/details/:id', getFacility); // Changed from '/:id' to '/details/:id'

// User rating route
router.post('/:facilityId/rate', protect, rateFacility);

// Owner specific routes
router.get('/owner/:ownerId/facilities', protect, authorize('facility_owner', 'admin'), getOwnerFacilities);
router.get('/owner/:ownerId/dashboard', protect, authorize('facility_owner', 'admin'), getDashboardStats);

// Court related routes
router.get('/facility/:facilityId/courts', getFacilityCourts); // Changed from '/:facilityId/courts'
router.get('/courts/details/:id', getCourt); // Changed from '/courts/:id'

// Facility Owner management routes
router.post('/create', protect, authorize('facility_owner', 'admin'), upload.array('photos', 10), createFacility);
router.put('/update/:id', protect, authorize('facility_owner', 'admin'), upload.array('photos', 10), updateFacility);
router.delete('/remove/:id', protect, authorize('facility_owner', 'admin'), deleteFacility);

// Mount Court Routes with specific base path
router.use('/facility/:facilityId/courts', require('./courtRoutes'));

module.exports = router;
