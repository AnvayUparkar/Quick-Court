const Booking = require('../models/Booking');
const Court = require('../models/Court');
const Facility = require('../models/Facility');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get statistics for facility owner dashboard
// @route   GET /api/owner/dashboard-stats
// @access  Private/Facility Owner
exports.getDashboardStats = catchAsync(async (req, res, next) => {
    // Find facilities owned by the current user
    const facilities = await Facility.find({ ownerId: req.user.id });
    const facilityIds = facilities.map(fac => fac._id);

    // Get courts owned by the owner
    const courts = await Court.find({ facilityId: { $in: facilityIds } });
    const activeCourts = courts.length;

    // Get bookings for these facilities
    const bookings = await Booking.find({ facilityId: { $in: facilityIds }, status: { $in: ['confirmed', 'completed'] } });
    const totalBookings = bookings.length;

    // Calculate total earnings (sum of pricePerHour for each booking's court)
    let totalEarnings = 0;
    for (const booking of bookings) {
        const court = courts.find(c => c._id.toString() === booking.courtId.toString());
        if (court) {
            totalEarnings += court.pricePerHour;
        }
    }

    res.status(200).json({
        success: true,
        data: {
            totalBookings,
            activeCourts,
            totalEarnings
        }
    });
});
