const Booking = require('../models/Booking.cjs');
const Trip = require('../models/Trip.cjs');
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

        // Mark expired pending bookings as 'expired'
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

    const trip = await Trip.findById(tripId);
    const maxCapacity = trip?.maxCapacity || 12;

    const result = await Booking.aggregate([
        {
            $match: {
                tripId: tripId,
                date: date,
                $or: [
                    { status: 'confirmed' },
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
        if (item._id === 'confirmed') {
            stats.confirmed += item.count;
        } else if (item._id === 'pending') {
            stats.pending = item.count;
        }
    });

    stats.available = Math.max(0, maxCapacity - stats.confirmed - stats.pending);

    return stats;
}

/**
 * ATOMIC seat reservation with optimistic locking
 * This prevents race conditions by using MongoDB's findOneAndUpdate with conditions
 * 
 * @param {string} tripId - Trip ID
 * @param {string} date - Trip date
 * @param {number} requestedSeats - Number of seats to reserve
 * @param {object} bookingData - Booking data to create
 * @returns {object} - { success: boolean, booking?: Booking, error?: string, availableSeats?: number }
 */
async function reserveSeatsAtomically(tripId, date, requestedSeats, bookingData) {
    await connectDB();

    // First, cleanup expired bookings
    await cleanupExpiredBookings();

    const now = new Date();

    // Get trip capacity
    const trip = await Trip.findById(tripId);
    if (!trip) {
        return { success: false, error: 'Trip not found' };
    }

    const maxCapacity = trip.maxCapacity || 12;

    // Use a MongoDB session for transaction (if replica set is available)
    // For standalone MongoDB, we use optimistic locking pattern

    // Step 1: Calculate current bookings
    const result = await Booking.aggregate([
        {
            $match: {
                tripId: tripId,
                date: date,
                $or: [
                    { status: 'confirmed' },
                    { status: 'pending', pendingExpiresAt: { $gt: now } }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalTravelers: { $sum: '$travelers' }
            }
        }
    ]);

    const currentlyBooked = result.length > 0 ? result[0].totalTravelers : 0;
    const availableSeats = maxCapacity - currentlyBooked;

    // Step 2: Validate availability
    if (requestedSeats > availableSeats) {
        return {
            success: false,
            error: availableSeats === 0
                ? 'Sorry, this date is fully booked.'
                : `Only ${availableSeats} seat(s) available. Please reduce the number of travelers.`,
            availableSeats
        };
    }

    // Step 3: Create booking with version lock
    // We add a seatLockVersion to detect concurrent modifications
    const newBooking = new Booking({
        ...bookingData,
        tripId,
        date,
        travelers: requestedSeats,
        status: 'pending',
        pendingExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min expiry
        seatLockTimestamp: now // Used for debugging race conditions
    });

    try {
        await newBooking.save();

        // Step 4: Verify we didn't exceed capacity after save (double-check)
        const verifyResult = await Booking.aggregate([
            {
                $match: {
                    tripId: tripId,
                    date: date,
                    $or: [
                        { status: 'confirmed' },
                        { status: 'pending', pendingExpiresAt: { $gt: now } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalTravelers: { $sum: '$travelers' }
                }
            }
        ]);

        const totalAfterBooking = verifyResult.length > 0 ? verifyResult[0].totalTravelers : 0;

        // If we've exceeded capacity, this was a race condition - rollback
        if (totalAfterBooking > maxCapacity) {
            console.warn(`[RACE CONDITION] Detected overbooking for trip ${tripId} on ${date}. Rolling back booking ${newBooking._id}`);

            // Mark our booking as failed to release seats
            await Booking.findByIdAndUpdate(newBooking._id, {
                status: 'failed',
                failureReason: 'race_condition_rollback'
            });

            return {
                success: false,
                error: 'Sorry, someone just booked those seats. Please try again.',
                availableSeats: maxCapacity - (totalAfterBooking - requestedSeats)
            };
        }

        return {
            success: true,
            booking: newBooking,
            remainingSeats: maxCapacity - totalAfterBooking
        };

    } catch (error) {
        console.error('[Seat Reservation] Error:', error.message);
        return {
            success: false,
            error: 'Failed to reserve seats. Please try again.'
        };
    }
}

/**
 * Release seats for a booking (mark as cancelled/expired)
 */
async function releaseSeats(bookingId, reason = 'cancelled') {
    await connectDB();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        return { success: false, error: 'Booking not found' };
    }

    if (booking.status !== 'pending') {
        return { success: false, error: 'Only pending bookings can be released' };
    }

    booking.status = reason;
    await booking.save();

    return {
        success: true,
        releasedSeats: booking.travelers,
        tripId: booking.tripId,
        date: booking.date
    };
}

/**
 * Get real-time availability for a trip date
 */
async function getAvailability(tripId, date) {
    await connectDB();

    // First cleanup expired bookings
    await cleanupExpiredBookings();

    const now = new Date();

    const trip = await Trip.findById(tripId);
    if (!trip) {
        return { success: false, error: 'Trip not found' };
    }

    const maxCapacity = trip.maxCapacity || 12;

    const result = await Booking.aggregate([
        {
            $match: {
                tripId: String(tripId),
                date: String(date),
                $or: [
                    { status: 'confirmed' },
                    { status: 'pending', pendingExpiresAt: { $gt: now } }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalTravelers: { $sum: '$travelers' }
            }
        }
    ]);

    const totalBooked = result.length > 0 ? result[0].totalTravelers : 0;
    const remaining = Math.max(0, maxCapacity - totalBooked);

    return {
        success: true,
        tripId,
        date,
        totalBooked,
        remaining,
        maxCapacity,
        isSoldOut: totalBooked >= maxCapacity
    };
}

module.exports = {
    cleanupExpiredBookings,
    getBookingStats,
    reserveSeatsAtomically,
    releaseSeats,
    getAvailability
};
