const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking.cjs');
const connectDB = require('../lib/db.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// GET booking stats (Monthly) - Admin only
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();

    // Calculate date range for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Aggregate bookings by year-month for the last 6 months
    const stats = await Booking.aggregate([
      {
        $match: {
          status: 'confirmed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Generate array of last 6 months with proper labels
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // 1-indexed

      // Find matching data from aggregation
      const found = stats.find(s => s._id.year === year && s._id.month === month);

      result.push({
        month: monthNames[month - 1],
        bookings: found ? found.bookings : 0,
        revenue: found ? found.revenue : 0
      });
    }

    res.json(result);
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;