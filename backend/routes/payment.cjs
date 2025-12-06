const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController.cjs');

// Route to initiate payment
router.post('/initiate', paymentController.initiatePayment);

// Route to handle callback/redirect from PhonePe
// Note: This endpoint is hit by PhonePe/User Browser via GET or POST depending on mode.
// We used REDIRECT mode in controller, so a GET request usually follows.
router.get('/validate/:merchantTransactionId', paymentController.validatePayment);
router.post('/validate/:merchantTransactionId', paymentController.validatePayment);

module.exports = router;