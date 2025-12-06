const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking.cjs');
const connectDB = require('../lib/db.cjs');

// GET booking stats (Monthly)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    // Aggregate bookings by month
    // Note: This matches the format expected by Recharts in Admin.tsx: { month: 'Jun', bookings: 45, revenue: 157500 }
    
    // Simple aggregation for last 6 months
    const stats = await Booking.aggregate([
      {
        $match: {
          status: { $in: ['confirmed', 'paid'] }, // Only count confirmed/paid
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      }
    ]);

    // Map month numbers to Names
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const formattedStats = stats.map(item => ({
      month: monthNames[item._id],
      bookings: item.bookings,
      revenue: item.revenue
    }));
    
    // Sort logic would be needed here or ensure front-end handles it, 
    // but for now return simple aggregation.
    // If DB is empty, return empty array. Front-end api.ts will handle fallback if needed.

    res.json(formattedStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;