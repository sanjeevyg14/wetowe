const Booking = require('../models/Booking.cjs');
const connectDB = require('../lib/db.cjs');

/**
 * Cleanup expired pending bookings
 * This function marks old pending bookings as 'expired' to free up seats
 * 
 * Call this:
 * - On server startup
 * - Periodically via cron job (every 5-10 minutes)
 * - Before checking availability
 */
async function cleanupExpiredBookings() {
    try {
        await connectDB();

        const now = new Date();

        // Mark expired pending bookings as 'failed'
        const result = await Booking.updateMany(
            {
                status: 'pending',
                pendingExpiresAt: { $lt: now }
            },
            {
                $set: { status: 'expired' }
            }
        );

        if (result.modifiedCount > 0) {
            console.log(`[Cleanup] Expired ${result.modifiedCount} pending booking(s)`);
        }

        return result.modifiedCount;
    } catch (error) {
        console.error('[Cleanup] Error expiring bookings:', error.message);
        return 0;
    }
}

/**
 * Get booking statistics for a trip on a specific date
 */
async function getBookingStats(tripId, date) {
    await connectDB();

    const now = new Date();
    const Trip = require('../models/Trip.cjs');

    const trip = await Trip.findById(tripId);
    const maxCapacity = trip?.maxCapacity || 12;

    const result = await Booking.aggregate([
        {
            $match: {
                tripId: tripId,
                date: date,
                $or: [
                    { status: { $in: ['confirmed', 'paid'] } },
                    { status: 'pending', pendingExpiresAt: { $gt: now } }
                ]
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: '$travelers' }
            }
        }
    ]);

    const stats = {
        confirmed: 0,
        pending: 0,
        maxCapacity,
        available: maxCapacity
    };

    result.forEach(item => {
        if (item._id === 'confirmed' || item._id === 'paid') {
            stats.confirmed += item.count;
        } else if (item._id === 'pending') {
            stats.pending = item.count;
        }
    });

    stats.available = maxCapacity - stats.confirmed - stats.pending;

    return stats;
}

module.exports = {
    cleanupExpiredBookings,
    getBookingStats
};
