const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const authMiddleware = require('../middleware/authMiddleware');

// GET all bookings (Admin)
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Basic admin check (ideally role based in middleware)
    if (req.user.role !== 'admin') {
       return res.status(403).json({ message: "Access denied" });
    }
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET bookings by User
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Security check: Ensure requesting user matches param or is admin
    if (req.user.id !== req.params.userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized access to bookings" });
    }

    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET Check Availability (Count travelers for a specific trip and date)
router.get('/check-availability', async (req, res) => {
    try {
        const { tripId, date } = req.query;
        if (!tripId || !date) {
            return res.status(400).json({ message: "TripId and Date are required" });
        }

        // Sanitize inputs to ensure they are strings to prevent NoSQL injection
        const safeTripId = String(tripId);
        const safeDate = String(date);

        // Aggregate travelers for confirmed or pending bookings
        const result = await Booking.aggregate([
            {
                $match: {
                    tripId: safeTripId,
                    date: safeDate,
                    status: { $in: ['confirmed', 'paid', 'pending'] } 
                }
            },
            {
                $group: {
                    _id: null,
                    totalTravelers: { $sum: "$travelers" }
                }
            }
        ]);

        const totalBooked = result.length > 0 ? result[0].totalTravelers : 0;
        // Hardcoded limit of 12 as per requirement
        const maxCapacity = 12;
        const remaining = Math.max(0, maxCapacity - totalBooked);

        res.json({
            tripId: safeTripId,
            date: safeDate,
            totalBooked,
            remaining,
            isSoldOut: totalBooked >= maxCapacity
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT cancel booking
router.put('/:id/cancel', authMiddleware, async (req, res) => {
  try {
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
      if (req.user.role !== 'admin') {
          return res.status(403).json({ message: "Admin access required" });
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

module.exports = router;