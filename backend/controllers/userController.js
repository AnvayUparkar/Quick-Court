const User = require('../models/User');
const Booking = require('../models/Booking');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('-password');

    if (user) {
        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            verified: user.verified,
            bookings: user.bookings
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

exports.updateUserProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        // Handle avatar upload
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'quickcourt/avatars',
                resource_type: 'image'
            });
            user.avatar = result.secure_url;
            // Remove local file
            await unlinkAsync(req.file.path);
        } else if (req.body.avatar) {
            user.avatar = req.body.avatar;
        }

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            verified: updatedUser.verified,
            bookings: updatedUser.bookings,
            message: 'Profile updated successfully'
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// @desc    Get user bookings
// @route   GET /api/users/my-bookings
// @access  Private
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
