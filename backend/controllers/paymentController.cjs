const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking.cjs');
const connectDB = require('../lib/db.cjs');
const { reserveSeatsAtomically, cleanupExpiredBookings } = require('../lib/bookingUtils.cjs');

// Environment Variables (with Sandbox Defaults)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT';
const SALT_KEY = process.env.PHONEPE_SALT_KEY || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const SALT_INDEX = process.env.PHONEPE_SALT_INDEX || 1;
const ENV = process.env.PHONEPE_ENV || 'sandbox'; // 'sandbox' or 'production'
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

const BASE_URL = ENV === 'production'
    ? 'https://api.phonepe.com/apis/hermes'
    : 'https://api-preprod.phonepe.com/apis/pg-sandbox';

exports.initiatePayment = async (req, res) => {
    try {
        await connectDB();

        const {
            userId, tripId, tripTitle, tripImage,
            customerName, email, phone, date, travelers, totalPrice,
            pickupPoint
        } = req.body;

        // Validate required fields - userId is optional (guest booking allowed)
        if (!tripId || !date || !travelers || !totalPrice) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Use 'guest' as userId for non-authenticated bookings
        const effectiveUserId = userId || 'guest';

        // Validate travelers count
        if (travelers < 1 || travelers > 20) {
            return res.status(400).json({
                success: false,
                message: 'Invalid number of travelers (1-20 allowed)'
            });
        }

        // Generate unique transaction ID
        const transactionId = "MT" + Date.now() + uuidv4().slice(0, 4);

        // === ATOMIC SEAT RESERVATION ===
        // This function handles race conditions and prevents overbooking
        const reservationResult = await reserveSeatsAtomically(tripId, date, travelers, {
            userId: effectiveUserId,
            tripTitle,
            tripImage,
            customerName,
            email,
            phone,
            pickupPoint: pickupPoint || '',
            totalPrice,
            transactionId
        });

        if (!reservationResult.success) {
            return res.status(400).json({
                success: false,
                message: reservationResult.error,
                availableSeats: reservationResult.availableSeats
            });
        }

        const newBooking = reservationResult.booking;
        // === END ATOMIC SEAT RESERVATION ===

        // Prepare PhonePe Payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: effectiveUserId,
            amount: totalPrice * 100, // Amount in paise
            redirectUrl: `${BACKEND_URL}/api/payment/validate/${transactionId}`,
            redirectMode: "REDIRECT",
            callbackUrl: `${BACKEND_URL}/api/payment/validate/${transactionId}`,
            mobileNumber: phone,
            paymentInstrument: {
                type: "PAY_PAGE"
            }
        };

        const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
        const stringToHash = base64Payload + "/pg/v1/pay" + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + SALT_INDEX;

        // Call PhonePe API
        const options = {
            method: 'POST',
            url: `${BASE_URL}/pg/v1/pay`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: base64Payload
            }
        };

        const response = await axios.request(options);

        if (response.data.success) {
            // Return the PhonePe redirect URL to frontend
            res.json({
                success: true,
                url: response.data.data.instrumentResponse.redirectInfo.url,
                bookingId: newBooking._id,
                remainingSeats: reservationResult.remainingSeats
            });
        } else {
            // Payment initiation failed, mark booking as failed to release seats
            await Booking.findByIdAndUpdate(newBooking._id, {
                status: 'failed',
                failureReason: 'payment_initiation_failed'
            });
            res.status(400).json({
                success: false,
                message: "Payment initiation failed",
                error: response.data
            });
        }

    } catch (error) {
        console.error("Payment Initiation Error:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.validatePayment = async (req, res) => {
    const { merchantTransactionId } = req.params;

    if (!merchantTransactionId) {
        return res.redirect(`${FRONTEND_URL}/destinations?error=InvalidTransaction`);
    }

    try {
        await connectDB();

        // Find the booking first
        const booking = await Booking.findOne({ transactionId: merchantTransactionId });
        if (!booking) {
            console.error(`Booking not found for transaction: ${merchantTransactionId}`);
            return res.redirect(`${FRONTEND_URL}/destinations?error=BookingNotFound`);
        }

        // Check if booking has expired while user was paying
        if (booking.status === 'expired') {
            console.warn(`Booking ${booking._id} expired during payment`);
            return res.redirect(`${FRONTEND_URL}/destinations?error=BookingExpired&message=Your+booking+expired+during+payment`);
        }

        // 1. Check Status with PhonePe
        const stringToHash = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(stringToHash).digest('hex');
        const checksum = sha256 + "###" + SALT_INDEX;

        const options = {
            method: 'GET',
            url: `${BASE_URL}/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': MERCHANT_ID
            }
        };

        const response = await axios.request(options);

        // 2. Update Booking Status
        if (response.data.code === 'PAYMENT_SUCCESS') {
            // Double-check the booking wasn't expired in the meantime
            const currentBooking = await Booking.findById(booking._id);
            if (currentBooking.status === 'expired' || currentBooking.status === 'cancelled') {
                // Payment succeeded but booking was expired/cancelled
                // This is a refund situation - log for manual handling
                console.error(`CRITICAL: Payment succeeded but booking ${booking._id} was ${currentBooking.status}`);
                await Booking.findByIdAndUpdate(booking._id, {
                    status: 'confirmed',
                    paymentResponse: response.data,
                    autoRecovered: true,
                    previousStatus: currentBooking.status
                });
                // Still redirect to success - we'll honor the payment
            } else {
                await Booking.findByIdAndUpdate(booking._id, {
                    status: 'confirmed',
                    paymentResponse: response.data
                });
            }

            return res.redirect(`${FRONTEND_URL}/my-bookings?status=success`);
        } else {
            // Payment failed - mark booking as failed to release seats
            await Booking.findByIdAndUpdate(booking._id, {
                status: 'failed',
                paymentResponse: response.data,
                failureReason: response.data.code || 'payment_failed'
            });
            return res.redirect(`${FRONTEND_URL}/destinations?status=failed`);
        }

    } catch (error) {
        console.error("Payment Validation Error:", error.message);
        return res.redirect(`${FRONTEND_URL}/destinations?status=error`);
    }
};

// Webhook handler for PhonePe callbacks (S2S - Server to Server)
exports.handleWebhook = async (req, res) => {
    try {
        await connectDB();

        // PhonePe sends base64 encoded response
        const { response } = req.body;

        if (!response) {
            return res.status(400).json({ success: false });
        }

        const decodedResponse = JSON.parse(Buffer.from(response, 'base64').toString());
        const merchantTransactionId = decodedResponse.data?.merchantTransactionId;

        if (!merchantTransactionId) {
            return res.status(400).json({ success: false });
        }

        // Verify webhook authenticity
        const xVerify = req.headers['x-verify'];
        const expectedHash = crypto
            .createHash('sha256')
            .update(response + SALT_KEY)
            .digest('hex') + '###' + SALT_INDEX;

        if (xVerify !== expectedHash) {
            console.error('Webhook verification failed');
            return res.status(401).json({ success: false });
        }

        // Update booking based on webhook data
        if (decodedResponse.code === 'PAYMENT_SUCCESS') {
            await Booking.findOneAndUpdate(
                { transactionId: merchantTransactionId },
                { status: 'confirmed', paymentResponse: decodedResponse }
            );
        } else {
            await Booking.findOneAndUpdate(
                { transactionId: merchantTransactionId },
                { status: 'failed', paymentResponse: decodedResponse }
            );
        }

        // Always respond with 200 to acknowledge webhook
        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.status(200).json({ success: true }); // Still respond 200 to prevent retries
    }
};