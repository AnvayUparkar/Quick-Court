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
router.get('/facility/:facilityId', getFacilityCourts);
router.get('/details/:id', getCourt); // Changed from '/:id'

// Private routes for Facility Owners
router.post('/', protect, authorize('facility_owner'), addCourt);
router.put('/update/:id', protect, authorize('facility_owner'), updateCourt); // Changed from '/:id'
router.delete('/remove/:id', protect, authorize('facility_owner'), deleteCourt); // Changed from '/:id'

// Time slot management
router.post('/:courtId/slots', protect, authorize('facility_owner'), addTimeSlot);
router.delete('/:courtId/slots/:slotId', protect, authorize('facility_owner'), removeTimeSlot);

module.exports = router;