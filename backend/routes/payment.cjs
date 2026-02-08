const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.cjs');
const { authMiddleware } = require('../middleware/auth.cjs');

// Route to initiate payment (authenticated users only)
router.post('/initiate', authMiddleware, paymentController.initiatePayment);

// Route to handle callback/redirect from PhonePe
// Note: This endpoint is hit by PhonePe/User Browser via GET or POST depending on mode.
// We used REDIRECT mode in controller, so a GET request usually follows.
router.get('/validate/:merchantTransactionId', paymentController.validatePayment);
router.post('/validate/:merchantTransactionId', paymentController.validatePayment);

// Webhook for Server-to-Server (S2S) callbacks from PhonePe
// This provides a reliable backup in case the redirect fails
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;