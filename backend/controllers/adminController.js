const User = require('../models/User');
const Facility = require('../models/Facility');
const Booking = require('../models/Booking');
const Court = require('../models/Court');
const catchAsync = require('../middleware/catchAsync');
const cloudinary = require('../config/cloudinary'); // Import cloudinary
const fs = require('fs'); // Import file system module

// @desc    Get global statistics (Admin Dashboard)
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const userCount = await User.countDocuments();
    const facilityCount = await Facility.countDocuments();
    const totalFacilityOwners = await User.countDocuments({ role: 'facility_owner' });
    const courtCount = await Court.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const totalActiveCourts = await Court.countDocuments({ /* criteria for active courts, e.g., is_active: true */ }); // Assuming a field for active courts
    const approvedFacilities = await Facility.countDocuments({ approved: true });
    const pendingFacilities = await Facility.countDocuments({ approved: false });

    res.status(200).json({
        success: true,
        data: {
            totalUsers: userCount,
            totalFacilityOwners,
            totalBookings: bookingCount,
            totalActiveCourts,
            approvedFacilities,
            pendingFacilities
        }
    });
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = catchAsync(async (req, res, next) => {
    const users = await User.find({}).select('-password');
    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update user (e.g., role, ban status)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    // Handle password update if provided
    if (req.body.password) {
        user.password = req.body.password; // Mongoose pre-save hook will hash this
    }

    // Handle avatar upload
    if (req.file) {
        try {
            // Upload image to cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'avatars',
                width: 150,
                height: 150,
                crop: 'fill'
            });
            user.avatar = result.secure_url;
            // Delete file from local storage after successful upload
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting local file:', err);
            });
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Image upload failed' });
        }
    } else if (req.body.removeAvatar === 'true') {
        // Allow removing avatar if explicitly requested and no new file is uploaded
        user.avatar = '';
    }

    user.role = req.body.role || user.role;
    user.verified = req.body.verified !== undefined ? req.body.verified : user.verified;
    user.isBanned = req.body.isBanned !== undefined ? req.body.isBanned : user.isBanned;

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: {
            id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            avatar: updatedUser.avatar,
            role: updatedUser.role,
            verified: updatedUser.verified,
            isBanned: updatedUser.isBanned,
        }
    });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    await user.deleteOne();

    res.status(200).json({
        success: true,
        message: 'User removed'
    });
});

// @desc    Get pending facilities for approval
// @route   GET /api/admin/facilities/pending
// @access  Private/Admin
exports.getPendingFacilities = catchAsync(async (req, res, next) => {
    const facilities = await Facility.find({ approved: false }).populate('ownerId', 'name email');
    res.status(200).json({
        success: true,
        count: facilities.length,
        data: facilities
    });
});

// @desc    Approve/Reject facility
// @route   PUT /api/admin/facilities/:id/approve
// @access  Private/Admin
exports.approveFacility = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { approved, comment } = req.body; // `approved` is boolean, `comment` is optional

    const facility = await Facility.findById(id);

    if (!facility) {
        return res.status(404).json({ message: 'Facility not found' });
    }

    facility.approved = approved;
    // You might want to store the comment somewhere on the facility model or a separate approval log
    await facility.save();

    res.status(200).json({
        success: true,
        message: `Facility ${approved ? 'approved' : 'rejected'} successfully`,
        data: facility
    });
});

// @desc    Get bookings for a specific user (Admin only)
// @route   GET /api/admin/users/:userId/bookings
// @access  Private/Admin
exports.getUserBookings = catchAsync(async (req, res, next) => {
    const { userId } = req.params;

    const bookings = await Booking.find({ userId: userId })
        .populate('userId', 'name email')
        .populate('facilityId', 'name location')
        .populate('courtId', 'name sportType');

    res.status(200).json({
        success: true,
        count: bookings.length,
        data: bookings
    });
});
