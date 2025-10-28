const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const router = express.Router();

// Payment management routes
router.post('/order', createOrder);
router.post('/verify', verifyPayment);
router.get('/payment/:paymentId', getPaymentDetails);

module.exports = router;