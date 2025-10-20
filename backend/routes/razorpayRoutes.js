const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const router = express.Router();

// Create order endpoint
router.post('/create-order', createOrder);

// Verify payment endpoint
router.post('/verify-payment', verifyPayment);

// Get payment details endpoint (optional)
router.get('/payment/:paymentId', getPaymentDetails);

module.exports = router;