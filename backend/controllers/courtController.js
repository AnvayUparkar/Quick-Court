const Court = require('../models/Court');
const Facility = require('../models/Facility');
const catchAsync = require('../middleware/catchAsync');

// Helper function to generate slots for a given date and operating hours
const generateSlotsForDay = (date, operatingHours) => {
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const dayOperatingHours = operatingHours.find(oh => oh.day === dayOfWeek);

    if (!dayOperatingHours) {
        return [];
    }

    const [openHour, openMinute] = dayOperatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = dayOperatingHours.close.split(':').map(Number);

    let current = new Date(date);
    current.setHours(openHour, openMinute, 0, 0);

    let close = new Date(date);
    close.setHours(closeHour, closeMinute, 0, 0);

    const slots = [];
    while (current.getTime() < close.getTime()) {
        const slotTime = current.toTimeString().slice(0, 5);
        const slotDate = new Date(date);
        slotDate.setHours(0, 0, 0, 0);
        slots.push({ date: slotDate, time: slotTime, isBooked: false });
        current.setHours(current.getHours() + 1);
    }
    return slots;
};

// Helper function to generate slots for a date range
const generateSlotsForDateRange = (startDate, endDate, operatingHours) => {
    const allGeneratedSlots = [];
    let currentDateIter = new Date(startDate);
    currentDateIter.setHours(0, 0, 0, 0);

    const endDateTimeNormalized = new Date(endDate);
    endDateTimeNormalized.setHours(23, 59, 59, 999);

    while (currentDateIter <= endDateTimeNormalized) {
        allGeneratedSlots.push(...generateSlotsForDay(currentDateIter, operatingHours));
        currentDateIter.setDate(currentDateIter.getDate() + 1);
    }
    return allGeneratedSlots;
};

// @desc    Add a new court
// @route   POST /api/courts
// @access  Private/Facility Owner
exports.addCourt = catchAsync(async (req, res, next) => {
    const { facilityId, name, sportType, pricePerHour, operatingHours } = req.body;

    const facility = await Facility.findById(facilityId);

    if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to add court to this facility' });
    }

    const generatedSlots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeMonthsLater = new Date();
    threeMonthsLater.setDate(today.getDate() + 90); // Generate slots for the next 90 days

    generatedSlots.push(...generateSlotsForDateRange(today, threeMonthsLater, operatingHours));

    const court = await Court.create({
        facilityId,
        name,
        sportType,
        pricePerHour,
        operatingHours: operatingHours || [],
        slots: generatedSlots // Assign generated slots
    });

    facility.courts.push(court._id);
    await facility.save();

    res.status(201).json({
        success: true,
        data: court
    });
});

// @desc    Get all courts for a facility
// @route   GET /api/courts/facility/:facilityId
// @access  Public
exports.getFacilityCourts = catchAsync(async (req, res, next) => {
    const { facilityId } = req.params;

    const courts = await Court.find({ facilityId }).populate('slots'); // Populate slots

    res.status(200).json({
        success: true,
        count: courts.length,
        data: courts
    });
});

// @desc    Add a time slot to a court
// @route   POST /api/courts/:id/slots
// @access  Private/Facility Owner
exports.addTimeSlot = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { startDate, endDate, startTime, endTime } = req.body; 

    let court = await Court.findById(id);

    if (!court) {
        return res.status(404).json({ message: 'Court not found' });
    }

    console.log('addTimeSlot: Received data - Facility ID:', id, 'Start Date:', startDate, 'End Date:', endDate, 'Start Time:', startTime, 'End Time:', endTime);

    // Validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime()) || parsedStartDate > parsedEndDate) {
        console.error('addTimeSlot: Invalid date range detected.');
        return res.status(400).json({ message: 'Invalid start or end date provided.' });
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(startMinute) || isNaN(endHour) || isNaN(endMinute)) {
        console.error('addTimeSlot: Invalid time format detected.');
        return res.status(400).json({ message: 'Invalid start or end time format.' });
    }

    const facility = await Facility.findById(court.facilityId);

    if (!facility) {
        console.error('addTimeSlot: Facility not found for court ID:', court.facilityId);
        return res.status(404).json({ message: 'Facility not found' });
    }

    if (facility.ownerId.toString() !== req.user._id.toString()) {
        console.error('addTimeSlot: Authorization failed - user not owner of facility.');
        return res.status(403).json({ message: 'Not authorized to manage time slots for this court' });
    }

    const newSlots = [];
    let currentDateIter = new Date(parsedStartDate);
    currentDateIter.setHours(0, 0, 0, 0); 

    const endDateTimeNormalized = new Date(parsedEndDate);
    endDateTimeNormalized.setHours(23, 59, 59, 999); 

    console.log('addTimeSlot: Starting slot generation loop. Current date iter:', currentDateIter, 'End date normalized:', endDateTimeNormalized);

    // Loop through each day from startDate to endDate
    while (currentDateIter <= endDateTimeNormalized) {
        console.log('addTimeSlot: Processing date:', currentDateIter);
        const dateForSlot = new Date(currentDateIter); 
        dateForSlot.setHours(0, 0, 0, 0); 
        
        let currentSlotTime = new Date();
        currentSlotTime.setHours(startHour, startMinute, 0, 0);

        let endSlotTime = new Date();
        endSlotTime.setHours(endHour, endMinute, 0, 0);

        console.log('addTimeSlot: Generating slots for current date from', currentSlotTime.toTimeString().slice(0, 5), 'to', endSlotTime.toTimeString().slice(0, 5));

        while (currentSlotTime.getTime() < endSlotTime.getTime()) {
            const slotTimeString = currentSlotTime.toTimeString().slice(0, 5);
            
            // Check if slot already exists for this date and time
            const existingSlot = court.slots.find(
                s => new Date(s.date).setHours(0, 0, 0, 0) === dateForSlot.getTime() && s.time === slotTimeString
            );

            if (!existingSlot) {
                console.log('addTimeSlot: Adding new slot - Date:', dateForSlot, 'Time:', slotTimeString);
                newSlots.push({ date: dateForSlot, time: slotTimeString, isBooked: false });
            } else {
                console.log('addTimeSlot: Skipping existing slot - Date:', dateForSlot, 'Time:', slotTimeString);
            }
            currentSlotTime.setHours(currentSlotTime.getHours() + 1); // Add 1 hour
        }
        currentDateIter.setDate(currentDateIter.getDate() + 1);
    }

    console.log('addTimeSlot: Generated total new slots:', newSlots.length);

    if (newSlots.length === 0) {
        console.error('addTimeSlot: No new unique time slots generated.');
        return res.status(400).json({ message: 'No new unique time slots to add for the selected date and time range.' });
    }

    court.slots.push(...newSlots); 
    await court.save();
    console.log('addTimeSlot: Court saved successfully with new slots.');

    res.status(201).json({
        success: true,
        message: `Time slots added successfully for ${newSlots.length} individual slots.`,
        data: newSlots
    });
});

// @desc    Remove a time slot from a court
// @route   DELETE /api/courts/:id/slots/:slotId
// @access  Private/Facility Owner
exports.removeTimeSlot = catchAsync(async (req, res, next) => {
    const { id, slotId } = req.params;

    let court = await Court.findById(id);

    if (!court) {
        return res.status(404).json({ message: 'Court not found' });
    }

    const facility = await Facility.findById(court.facilityId);

    if (facility.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to manage time slots for this court' });
    }

    const initialSlotCount = court.slots.length;
    court.slots = court.slots.filter(slot => slot._id.toString() !== slotId);

    if (court.slots.length === initialSlotCount) {
        return res.status(404).json({ message: 'Time slot not found.' });
    }

    await court.save();

    res.status(200).json({
        success: true,
        message: 'Time slot removed successfully'
    });
});

// @desc    Get a single court by ID
// @route   GET /api/courts/:id
// @access  Public
exports.getCourt = catchAsync(async (req, res, next) => {
    const court = await Court.findById(req.params.id);

    if (!court) {
        return res.status(404).json({ message: 'Court not found' });
    }

    res.status(200).json({
        success: true,
        data: court
    });
});

// @desc    Update a court
// @route   PUT /api/courts/:id
// @access  Private/Facility Owner
exports.updateCourt = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { name, sportType, pricePerHour, operatingHours } = req.body;

    let court = await Court.findById(id);

    if (!court) {
        return res.status(404).json({ message: 'Court not found' });
    }

    const facility = await Facility.findById(court.facilityId);

    if (facility.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this court' });
    }

    court.name = name || court.name;
    court.sportType = sportType || court.sportType;
    court.pricePerHour = pricePerHour || court.pricePerHour;
    
    if (operatingHours) {
        court.operatingHours = operatingHours; 
        // Regenerate time slots based on new operating hours, preserving existing bookings
        const existingBookedSlots = court.slots.filter(s => s.isBooked);
        const newOperatingHoursSlots = generateSlotsForDateRange(new Date().setHours(0,0,0,0), new Date(new Date().setDate(new Date().getDate() + 90)).setHours(23,59,59,999), operatingHours);
        
        // Combine existing booked slots with new operating hours slots, avoiding duplicates
        const combinedSlots = [...existingBookedSlots];
        newOperatingHoursSlots.forEach(newSlot => {
            const exists = combinedSlots.some(existing => 
                new Date(existing.date).setHours(0,0,0,0) === new Date(newSlot.date).setHours(0,0,0,0) && 
                existing.time === newSlot.time
            );
            if (!exists) {
                combinedSlots.push(newSlot);
            }
        });
        court.slots = combinedSlots; // Replace existing slots with combined ones
    }

    const updatedCourt = await court.save();

    res.status(200).json({
        success: true,
        data: updatedCourt
    });
});

// @desc    Delete a court
// @route   DELETE /api/courts/:id
// @access  Private/Facility Owner
exports.deleteCourt = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const court = await Court.findById(id);

    if (!court) {
        return res.status(404).json({ message: 'Court not found' });
    }

    const facility = await Facility.findById(court.facilityId);

    if (facility.ownerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this court' });
    }

    await court.deleteOne();

    // Remove court from facility's courts array
    facility.courts = facility.courts.filter(c => c.toString() !== id);
    await facility.save();

    res.status(200).json({
        success: true,
        message: 'Court removed'
    });
});
