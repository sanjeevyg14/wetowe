const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Booking = require('../models/Booking.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');
const connectDB = require('../lib/db.cjs');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const { sendBookingNotification } = require('../lib/emailService.cjs');

const mapBooking = (b) => ({
  ...b.toObject(),
  id: b._id,
  bookedAt: b.createdAt
});

// POST create booking enquiry (Public)
router.post('/', async (req, res) => {
  try {
    await connectDB();
    const {
      userId,
      tripId,
      tripTitle,
      tripImage,
      customerName,
      email,
      phone,
      date,
      date,
      maleTravelers,
      femaleTravelers,
      pickupPoint,
      totalPrice
    } = req.body || {};

    if (!tripId || !tripTitle || !customerName || !email || !phone || !date || (maleTravelers === undefined && femaleTravelers === undefined) || !totalPrice) {
      return res.status(400).json({ message: 'Missing required booking fields' });
    }

    const mTrav = Number(maleTravelers) || 0;
    const fTrav = Number(femaleTravelers) || 0;
    const totalTrav = mTrav + fTrav;

    if (totalTrav === 0) {
      return res.status(400).json({ message: 'At least one traveler is required' });
    }

    if (!validator.isEmail(String(email))) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Allow 10-15 digits, optionally starting with '+' (supports international/country codes)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(String(phone))) {
      return res.status(400).json({ message: 'Invalid phone number format. Must be 10 to 15 digits, optionally starting with "+".' });
    }

    const { getAvailability } = require('../lib/bookingUtils.cjs');
    const availability = await getAvailability(String(tripId), String(date));
    if (!availability.success) {
      return res.status(400).json({ message: availability.error || 'Unable to verify availability' });
    }
    
    if (totalTrav > availability.remaining) {
      return res.status(400).json({ message: `Only ${availability.remaining} total seat(s) available` });
    }
    if (mTrav > availability.remainingMale) {
      return res.status(400).json({ message: `Only ${availability.remainingMale} male seat(s) available` });
    }
    if (fTrav > availability.remainingFemale) {
      return res.status(400).json({ message: `Only ${availability.remainingFemale} female seat(s) available` });
    }

    const booking = new Booking({
      userId: userId || 'guest',
      tripId: String(tripId),
      tripTitle: String(tripTitle),
      tripImage: tripImage || '',
      customerName: String(customerName),
      email: String(email),
      phone: String(phone),
      date: String(date),
      travelers: totalTrav,
      maleTravelers: mTrav,
      femaleTravelers: fTrav,
      pickupPoint: pickupPoint ? String(pickupPoint) : '',
      totalPrice: Number(totalPrice),
      transactionId: `MANUAL-${uuidv4().slice(-6).toUpperCase()}`,
      status: 'pending',
      pendingExpiresAt: null
    });

    await booking.save();

    try {
      await sendBookingNotification(booking);
    } catch (emailError) {
      console.error('[Booking Email] Failed to send notification:', emailError.message);
    }

    res.status(201).json(mapBooking(booking));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all bookings (Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    // Basic admin check (ideally role based in middleware)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Access denied" });
    }
    const bookings = await Booking.find().sort({ createdAt: -1 });
    // Map createdAt to bookedAt for frontend compatibility
    const mappedBookings = bookings.map(mapBooking);
    res.json(mappedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET bookings by User
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    // Security check: Ensure requesting user matches param or is admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized access to bookings" });
    }

    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    // Map createdAt to bookedAt for frontend compatibility
    const mappedBookings = bookings.map(mapBooking);
    res.json(mappedBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Check Availability (Count travelers for a specific trip and date)
router.get('/check-availability', async (req, res) => {
  try {
    await connectDB();
    const { tripId, date } = req.query;
    if (!tripId || !date) {
      return res.status(400).json({ message: "TripId and Date are required" });
    }

    // Use the improved utility function that handles cleanup and race conditions
    const { getAvailability } = require('../lib/bookingUtils.cjs');
    const availability = await getAvailability(tripId, date);

    if (!availability.success) {
      return res.status(404).json({ message: availability.error });
    }

    res.json({
      tripId: availability.tripId,
      date: availability.date,
      totalBooked: availability.totalBooked,
      remaining: availability.remaining,
      maxCapacity: availability.maxCapacity,
      isSoldOut: availability.isSoldOut
    });

  } catch (err) {
    console.error('[Availability Check Error]', err.message);
    res.status(500).json({ message: err.message });
  }
});

// PUT cancel booking
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Verify ownership
    if (booking.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT refund booking (Admin)
router.put('/:id/refund', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'refunded' },
      { new: true }
    );
    res.json(booking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update booking status (Admin)
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const status = typeof req.body?.status === 'string' ? req.body.status : '';
    const allowedStatuses = ['pending', 'contacted', 'confirmed', 'cancelled', 'refunded', 'failed', 'expired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(mapBooking(booking));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST cleanup expired pending bookings (Admin)
router.post('/cleanup-expired', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { cleanupExpiredBookings } = require('../lib/bookingUtils.cjs');
    const count = await cleanupExpiredBookings();

    res.json({
      success: true,
      message: `Expired ${count} pending booking(s)`,
      expiredCount: count
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET seat stats for a trip on a date (Admin)
router.get('/seat-stats', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    const tripId = typeof req.query?.tripId === 'string' ? req.query.tripId : '';
    const date = typeof req.query?.date === 'string' ? req.query.date : '';
    if (!tripId || !date) {
      return res.status(400).json({ message: "tripId and date are required" });
    }

    const { getBookingStats } = require('../lib/bookingUtils.cjs');
    const stats = await getBookingStats(tripId, date);

    // Also get list of pending bookings for this trip/date
    const pendingBookings = await Booking.find({
      tripId,
      date,
      status: { $in: ['pending', 'contacted'] }
    }).select('customerName email travelers createdAt pendingExpiresAt');

    res.json({
      ...stats,
      pendingBookings: pendingBookings.map(b => ({
        id: b._id,
        customerName: b.customerName,
        email: b.email,
        travelers: b.travelers,
        createdAt: b.createdAt,
        expiresAt: b.pendingExpiresAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT force-release a pending booking (Admin)
router.put('/:id/force-release', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid booking ID format' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({ message: "Only pending bookings can be force-released" });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({
      success: true,
      message: `Released ${booking.travelers} seat(s) for ${booking.customerName}`,
      booking
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;