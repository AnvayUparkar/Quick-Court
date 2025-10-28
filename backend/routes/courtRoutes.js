const express = require('express');
const {
    addCourt,
    getFacilityCourts,
    getCourt,
    updateCourt,
    deleteCourt,
    addTimeSlot,
    removeTimeSlot
} = require('../controllers/courtController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/list/:facilityId', getFacilityCourts); // Changed from '/facility/:facilityId'
router.get('/details/:id', getCourt); // Changed from '/:id'

// Private routes for Facility Owners
router.post('/create', protect, authorize('facility_owner'), addCourt); // Changed from '/'
router.put('/update/:id', protect, authorize('facility_owner'), updateCourt); // Changed from '/:id'
router.delete('/remove/:id', protect, authorize('facility_owner'), deleteCourt); // Changed from '/:id'

// Time slot management
router.post('/slots/add/:courtId', protect, authorize('facility_owner'), addTimeSlot); // Changed structure
router.delete('/slots/remove/:courtId/:slotId', protect, authorize('facility_owner'), removeTimeSlot); // Changed structure

module.exports = router;