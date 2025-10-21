const User = require('../models/User');
const catchAsync = require('../middleware/catchAsync');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary'); // Import cloudinary
const fs = require('fs'); // Import fs
const bcrypt = require('bcryptjs'); // Import bcrypt

// @desc    Register user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({ message: 'User already exists' });
    }

    let avatarUrl = '';
    if (req.file) {
        try {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'quickcourt/avatars',
            });
            avatarUrl = result.secure_url;
            fs.unlinkSync(req.file.path); // Remove file from local uploads folder
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Even if upload fails, continue with user creation but without avatar
            fs.unlinkSync(req.file.path); // Attempt to remove local file even if Cloudinary fails
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before creating user

    user = await User.create({
        name,
        email,
        password: hashedPassword, // Use hashed password
        role,
        avatar: avatarUrl || undefined
    });

    // Generate OTP (for simplicity, a 6-digit number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp; // Store OTP in user object temporarily, or in a separate model/cache
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    const message = `Your OTP for QuickCourt is: ${otp}. It is valid for 10 minutes.`;

    try {
        await sendEmail(user.email, 'QuickCourt OTP Verification', message); // Updated call

        res.status(201).json({
            success: true,
            message: 'OTP sent to email. Please verify your account.',
            userId: user._id
        });
    } catch (err) {
        console.error('Error in sendEmail for signup:', err); // Log the full error object
        user.otp = undefined; // Clear OTP if email sending fails
        await user.save();
        return res.status(500).json({ message: 'Email could not be sent. Please try again.', error: err.message }); // Send error message to frontend
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(400).json({ message: 'Invalid user ID.' });
    }

    if (user.otp !== otp || user.otpExpires < new Date(Date.now())) { // Check for OTP expiry
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.verified = true;
    user.otp = undefined; // Clear OTP after successful verification
    user.otpExpires = undefined; // Clear OTP expiry
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Account verified successfully. Please login.'
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    console.log('Login attempt for email:', email);
    console.log('Password received:', "[REDACTED]"); // Mask password for logs

    // Check for user and verified status
    const user = await User.findOne({ email });

    if (!user) {
        console.log('User not found for email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.isBanned) {
        console.log('User is banned:', user.email);
        return res.status(403).json({ message: 'You have been banned by the admin and you will not be able to login again. Please contact the admin for further assistance.' });
    }

    console.log('User found:', user.email);
    console.log('User verified status:', user.verified);

    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
        console.log('Password does not match for user:', user.email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.verified) {
        console.log('User not verified:', user.email);
        return res.status(401).json({ message: 'Account not verified. Please verify your email with OTP.' });
    }

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.status(200).json({
        success: true,
        token,
        refreshToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            isBanned: user.isBanned, // Include isBanned status
        }
    });
});

// @desc    Refresh Token
// @route   POST /api/auth/refresh-token
// @access  Public (but requires refresh token)
exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not provided.' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        const newToken = generateToken(user._id, user.role);
        const newRefreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            token: newToken,
            refreshToken: newRefreshToken,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired refresh token.' });
    }
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOtp = catchAsync(async (req, res, next) => {
    const { userId } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes
    await user.save();

    const message = `Your new OTP for QuickCourt is: ${otp}. It is valid for 10 minutes.`;

    try {
        await sendEmail(user.email, 'QuickCourt OTP Resend', message); // Updated call

        res.status(200).json({
            success: true,
            message: 'New OTP sent to email.'
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Email could not be sent. Please try again.' });
    }
});