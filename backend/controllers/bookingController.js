const Booking = require('../models/Booking');
const Court = require('../models/Court');
const User = require('../models/User');
const Facility = require('../models/Facility'); // Add this missing import
const catchAsync = require('../middleware/catchAsync');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private/User
exports.createBooking = catchAsync(async (req, res, next) => {
    console.log('createBooking: Received request body:', req.body);
    console.log('createBooking: User ID from token:', req.user.id);

    const { facilityId, courtId, date, timeSlot } = req.body;

    const court = await Court.findById(courtId);

    if (!court) {
        console.log('createBooking: Court not found for ID:', courtId);
        return res.status(404).json({ message: 'Court not found' });
    }
    console.log('createBooking: Found court:', court.name);

    // Check if the slot is available
    const targetDate = new Date(date).setHours(0, 0, 0, 0);
    console.log('createBooking: Target Date (midnight):', targetDate);
    console.log('createBooking: Time Slot:', timeSlot);
    const slotIndex = court.slots.findIndex(
        s => new Date(s.date).setHours(0, 0, 0, 0) === targetDate && s.time === timeSlot && !s.isBooked
    );
    console.log('createBooking: Found slotIndex:', slotIndex);

    if (slotIndex === -1) {
        return res.status(400).json({ message: 'Selected time slot is not available or already booked.' });
    }

    // Create booking
    const booking = await Booking.create({
        userId: req.user.id,
        facilityId,
        courtId,
        date: targetDate,
        timeSlot,
        status: 'confirmed' // Simulate instant payment confirmation
    });
    console.log('createBooking: Booking created:', booking);

    // Mark slot as booked
    court.slots[slotIndex].isBooked = true;
    court.slots[slotIndex].bookedBy = req.user.id;
    await court.save();
    console.log('createBooking: Court slot marked as booked.');

    // Add booking to user's bookings
    const user = await User.findById(req.user.id);
    console.log('createBooking: Found user for updating bookings:', user.email);
    user.bookings.push(booking._id);
    await user.save();
    console.log('createBooking: Booking added to user\'s profile.');

    res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: booking
    });
});

// @desc    Get all bookings for authenticated user
// @route   GET /api/bookings/my-bookings
// @access  Private/User
exports.getMyBookings = catchAsync(async (req, res, next) => {
    const bookings = await Booking.find({ userId: req.user.id })
        .populate('facilityId', 'name location')
        .populate('courtId', 'name sportType');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

// @desc    Get all bookings (Admin/Facility Owner)
// @route   GET /api/bookings
// @access  Private/Admin or Facility Owner
exports.getAllBookings = catchAsync(async (req, res, next) => {
    let query = {};
    if (req.user.role === 'facility_owner') {
        // Find facilities owned by the current user
        const facilities = await Facility.find({ ownerId: req.user.id });
        const facilityIds = facilities.map(fac => fac._id);
        query.facilityId = { $in: facilityIds };
    }

    const bookings = await Booking.find(query)
        .populate('userId', 'name email')
        .populate('facilityId', 'name location')
        .populate('courtId', 'name sportType');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

// @desc    Get bookings for facility owner
// @route   GET /api/bookings/owner
// @access  Private/Facility Owner
exports.getOwnerBookings = catchAsync(async (req, res, next) => { // Added comment to trigger file change
    // Find facilities owned by the current user
    const facilities = await Facility.find({ ownerId: req.user.id });
    const facilityIds = facilities.map(fac => fac._id);

    const bookings = await Booking.find({ facilityId: { $in: facilityIds } })
        .populate('userId', 'name email')
        .populate('facilityId', 'name location')
        .populate('courtId', 'name sportType');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/User, Facility Owner or Admin
exports.cancelBooking = catchAsync(async (req, res, next) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    if (booking.userId.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
        // If facility owner, check if they own the facility associated with the booking
        const facility = await Facility.findById(booking.facilityId);
        if (req.user.role === 'facility_owner' && facility.ownerId.toString() === req.user.id.toString()) {
            // Authorized as facility owner
        } else {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({ message: 'Booking already cancelled' });
    }

    // Mark slot as unbooked
    const court = await Court.findById(booking.courtId);
    if (court) {
        const targetDate = new Date(booking.date).setHours(0, 0, 0, 0);
        const slot = court.slots.find(
            s => new Date(s.date).setHours(0, 0, 0, 0) === targetDate && s.time === booking.timeSlot
        );
        if (slot) {
            slot.isBooked = false;
            slot.bookedBy = undefined;
            await court.save();
        }
    }

    booking.status = 'cancelled';
    await booking.save();

    // Remove booking from user's bookings
    const user = await User.findById(booking.userId);
    if (user) {
        user.bookings = user.bookings.filter(b => b.toString() !== booking._id.toString());
        await user.save();
    }

    res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
    });
});