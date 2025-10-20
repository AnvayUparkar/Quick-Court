const Review = require('../models/Review');
const Facility = require('../models/Facility');
const catchAsync = require('../middleware/catchAsync');

// @desc    Add a rating/review for a facility
// @route   POST /api/facilities/:id/rate
// @access  Private (user must be logged in)
exports.rateFacility = catchAsync(async (req, res, next) => {
    const { rating, comment } = req.body;
    const facilityId = req.params.id;
    const userId = req.user._id;

    if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    // Check if facility exists
    const facility = await Facility.findById(facilityId);
    if (!facility || !facility.approved) {
        return res.status(404).json({ success: false, message: 'Facility not found or not approved.' });
    }

    // Check if user already rated this facility
    const existingReview = await Review.findOne({ facilityId, userId });
    if (existingReview) {
        // Update existing review
        existingReview.rating = rating;
        existingReview.comment = comment;
        await existingReview.save();
        return res.status(200).json({ success: true, message: 'Review updated.', data: existingReview });
    }

    // Create new review
    const review = await Review.create({ facilityId, userId, rating, comment });
    res.status(201).json({ success: true, message: 'Review added.', data: review });
});

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find().populate('user', 'name');
    res.status(200).json({
        success: true,
        count: reviews.length,
        data: reviews
    });
});