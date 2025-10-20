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
router.get('/facility/:facilityId', getFacilityCourts); // Get all courts for a specific facility
router.get('/:id', getCourt); // Get a single court by ID

// Private routes for Facility Owners
router.post('/', protect, authorize('facility_owner'), addCourt); // Add a new court
router.put('/:id', protect, authorize('facility_owner'), updateCourt); // Update a court
router.delete('/:id', protect, authorize('facility_owner'), deleteCourt); // Delete a court

// Time slot management
router.post('/:id/slots', protect, authorize('facility_owner'), addTimeSlot); // Add a new time slot
router.delete('/:id/slots/:slotId', protect, authorize('facility_owner'), removeTimeSlot); // Remove a time slot

module.exports = router;