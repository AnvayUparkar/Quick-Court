const express = require('express');
const { createOrder, verifyPayment, getPaymentDetails } = require('../controllers/paymentController');
const router = express.Router();

// Payment management routes
router.post('/orders/create', createOrder);
router.post('/payments/verify', verifyPayment);
router.get('/payments/details/:paymentId', getPaymentDetails);

module.exports = router;