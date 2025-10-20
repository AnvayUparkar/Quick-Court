const express = require('express');
const { signup, verifyOtp, login, refreshToken } = require('../controllers/authController');
const upload = require('../utils/multer'); // Import multer

const router = express.Router();

router.post('/signup', upload.single('avatar'), signup);
router.post('/verify-otp', verifyOtp);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

module.exports = router;
