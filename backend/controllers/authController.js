const User = require('../models/User');
const catchAsync = require('../middleware/catchAsync');
const { generateToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const cloudinary = require('../config/cloudinary'); // Import cloudinary
const fs = require('fs'); // Import fs
const bcrypt = require('bcryptjs'); // Import bcrypt
const OTP = require('../models/OTP'); // Import OTP model
const { sendOtpHandler, generateAndSendOtpLogic } = require('./otpController'); // Import both handlers

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
            // When using memoryStorage, req.file.buffer contains the file content
            const result = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`, {
                folder: 'quickcourt/avatars',
            });
            avatarUrl = result.secure_url;
            // fs.unlinkSync(req.file.path); // No need to delete local file with memoryStorage
        } catch (uploadError) {
            console.error('Cloudinary upload error:', uploadError);
            // Even if upload fails, continue with user creation but without avatar
            // fs.unlinkSync(req.file.path); // No need to delete local file with memoryStorage
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password before creating user

    user = await User.create({
        name,
        email,
        password: hashedPassword, // Use hashed password
        role,
        avatar: avatarUrl || undefined,
        verified: false, // User is not verified until OTP is confirmed
    });

    // Generate and Send OTP without sending a response here
    const otpSendResult = await generateAndSendOtpLogic(email);

    if (!otpSendResult.success) {
        // If OTP sending failed, respond with an error and potentially delete the created user
        await User.deleteOne({ _id: user._id }); // Clean up user if OTP fails
        return res.status(500).json({ message: otpSendResult.error || 'Failed to send OTP for verification.' });
    }

    res.status(201).json({
        success: true,
        message: 'User registered successfully. OTP sent for verification.',
        userId: user._id
    });
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOtp = catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    console.log('Verify OTP - Received Email:', email);
    console.log('Verify OTP - Received OTP:', otp);

    const otpRecord = await OTP.findOne({ email, otp });

    console.log('Verify OTP - OTP Record Found:', otpRecord);

    if (!otpRecord) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    // If OTP exists and is not expired (handled by MongoDB TTL index),
    // find the user and mark as verified.
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    user.verified = true;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id }); // Delete OTP after successful verification

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
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    // Invalidate any existing OTPs for the user
    await OTP.deleteMany({ email });

    // Use the sendOtpHandler to generate and send a new OTP
    // The sendOtpHandler already includes rate limiting and OTP storage
    // We now use generateAndSendOtpLogic directly and handle the response here
    const otpResendResult = await generateAndSendOtpLogic(email);

    if (otpResendResult.success) {
        res.status(200).json({ success: true, message: otpResendResult.message });
    } else {
        if (otpResendResult.error === "Please wait before resending OTP") {
            res.status(429).json({ error: otpResendResult.error });
        } else {
            res.status(500).json({ error: otpResendResult.error || "Failed to resend OTP" });
        }
    }
});