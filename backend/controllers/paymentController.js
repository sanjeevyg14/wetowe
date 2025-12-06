const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const Booking = require('../models/Booking');

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
        const { 
            userId, tripId, tripTitle, tripImage, 
            customerName, email, phone, date, travelers, totalPrice 
        } = req.body;

        const transactionId = "MT" + Date.now() + uuidv4().slice(0, 4);

        // 1. Save Booking as Pending
        const newBooking = new Booking({
            userId, tripId, tripTitle, tripImage,
            customerName, email, phone, date, travelers, totalPrice,
            transactionId,
            status: 'pending'
        });
        await newBooking.save();

        // 2. Prepare PhonePe Payload
        const payload = {
            merchantId: MERCHANT_ID,
            merchantTransactionId: transactionId,
            merchantUserId: userId,
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

        // 3. Call PhonePe API
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
                bookingId: newBooking._id
            });
        } else {
            res.status(400).json({ success: false, message: "Payment initiation failed", error: response.data });
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
            await Booking.findOneAndUpdate(
                { transactionId: merchantTransactionId }, 
                { status: 'confirmed', paymentResponse: response.data }
            );
            return res.redirect(`${FRONTEND_URL}/my-bookings?status=success`);
        } else {
            await Booking.findOneAndUpdate(
                { transactionId: merchantTransactionId }, 
                { status: 'failed', paymentResponse: response.data }
            );
            return res.redirect(`${FRONTEND_URL}/destinations?status=failed`);
        }

    } catch (error) {
        console.error("Payment Validation Error:", error.message);
        return res.redirect(`${FRONTEND_URL}/destinations?status=error`);
    }
};