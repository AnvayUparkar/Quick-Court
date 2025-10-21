const express = require('express');
const { signup, verifyOtp, login, refreshToken, resendOtp } = require('../controllers/authController'); // Add resendOtp
const { sendOtpHandler } = require('../controllers/otpController'); // Import sendOtpHandler
const catchAsync = require('../middleware/catchAsync'); // Import catchAsync
const upload = require('../utils/multer'); // Import multer

const router = express.Router();

router.post('/signup', upload.single('avatar'), signup);
router.post('/verify-otp', verifyOtp);
router.post('/send-otp', catchAsync(sendOtpHandler)); // Wrap sendOtpHandler with catchAsync
router.post('/resend-otp', resendOtp); // Add resend OTP route
router.post('/login', login);
router.post('/refresh-token', refreshToken);

module.exports = router;
