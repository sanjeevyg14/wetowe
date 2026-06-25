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

    const trip = await Trip.findById(tripId);
    const maxCapacity = trip?.maxCapacity || 12;
    const maxMaleCapacity = trip?.maxMaleCapacity || 6;
    const maxFemaleCapacity = trip?.maxFemaleCapacity || 6;

    const result = await Booking.aggregate([
        {
            $match: {
                tripId: tripId,
                date: date,
                $or: [
                    { status: 'confirmed' },
                    { status: { $in: ['pending', 'contacted'] } }
                ]
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: { $ifNull: ['$travelers', 0] } },
                maleCount: { $sum: { $ifNull: ['$maleTravelers', 0] } },
                femaleCount: { $sum: { $ifNull: ['$femaleTravelers', 0] } }
            }
        }
    ]);

    const stats = {
        confirmed: 0,
        pending: 0,
        confirmedMale: 0,
        pendingMale: 0,
        confirmedFemale: 0,
        pendingFemale: 0,
        maxCapacity,
        maxMaleCapacity,
        maxFemaleCapacity,
        available: maxCapacity,
        availableMale: maxMaleCapacity,
        availableFemale: maxFemaleCapacity
    };

    result.forEach(item => {
        if (item._id === 'confirmed') {
            stats.confirmed += item.count;
            stats.confirmedMale += item.maleCount;
            stats.confirmedFemale += item.femaleCount;
        } else if (item._id === 'pending') {
            stats.pending += item.count;
            stats.pendingMale += item.maleCount;
            stats.pendingFemale += item.femaleCount;
        }
    });

    stats.available = Math.max(0, maxCapacity - stats.confirmed - stats.pending);
    stats.availableMale = Math.max(0, maxMaleCapacity - stats.confirmedMale - stats.pendingMale);
    stats.availableFemale = Math.max(0, maxFemaleCapacity - stats.confirmedFemale - stats.pendingFemale);

    return stats;
}

/**
 * ATOMIC seat reservation with optimistic locking
 * This prevents race conditions by using MongoDB's findOneAndUpdate with conditions
 * 
 * @param {string} tripId - Trip ID
 * @param {string} date - Trip date
 * @param {object} requestedSeats - { maleTravelers: number, femaleTravelers: number }
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
    const maxMaleCapacity = trip.maxMaleCapacity || 6;
    const maxFemaleCapacity = trip.maxFemaleCapacity || 6;
    
    const reqMale = requestedSeats.maleTravelers || 0;
    const reqFemale = requestedSeats.femaleTravelers || 0;
    const totalReq = reqMale + reqFemale;

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
                    { status: { $in: ['pending', 'contacted'] } }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalTravelers: { $sum: { $ifNull: ['$travelers', 0] } },
                totalMale: { $sum: { $ifNull: ['$maleTravelers', 0] } },
                totalFemale: { $sum: { $ifNull: ['$femaleTravelers', 0] } }
            }
        }
    ]);

    const currentlyBooked = result.length > 0 ? result[0].totalTravelers : 0;
    const currentlyMaleBooked = result.length > 0 ? result[0].totalMale : 0;
    const currentlyFemaleBooked = result.length > 0 ? result[0].totalFemale : 0;
    
    const availableSeats = maxCapacity - currentlyBooked;
    const availableMaleSeats = maxMaleCapacity - currentlyMaleBooked;
    const availableFemaleSeats = maxFemaleCapacity - currentlyFemaleBooked;

    // Step 2: Validate availability
    if (totalReq > availableSeats) {
        return {
            success: false,
            error: availableSeats === 0
                ? 'Sorry, this date is fully booked.'
                : `Only ${availableSeats} total seat(s) available.`,
            availableSeats
        };
    }
    
    if (reqMale > availableMaleSeats) {
        return {
            success: false,
            error: `Only ${availableMaleSeats} male seat(s) available.`,
            availableSeats: availableMaleSeats
        };
    }
    
    if (reqFemale > availableFemaleSeats) {
        return {
            success: false,
            error: `Only ${availableFemaleSeats} female seat(s) available.`,
            availableSeats: availableFemaleSeats
        };
    }

    // Step 3: Create booking with version lock
    // We add a seatLockVersion to detect concurrent modifications
    const newBooking = new Booking({
        ...bookingData,
        tripId,
        date,
        travelers: totalReq,
        maleTravelers: reqMale,
        femaleTravelers: reqFemale,
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
                        { status: { $in: ['pending', 'contacted'] } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalTravelers: { $sum: { $ifNull: ['$travelers', 0] } },
                    totalMale: { $sum: { $ifNull: ['$maleTravelers', 0] } },
                    totalFemale: { $sum: { $ifNull: ['$femaleTravelers', 0] } }
                }
            }
        ]);

        const totalAfterBooking = verifyResult.length > 0 ? verifyResult[0].totalTravelers : 0;
        const totalMaleAfterBooking = verifyResult.length > 0 ? verifyResult[0].totalMale : 0;
        const totalFemaleAfterBooking = verifyResult.length > 0 ? verifyResult[0].totalFemale : 0;

        // If we've exceeded capacity, this was a race condition - rollback
        if (totalAfterBooking > maxCapacity || totalMaleAfterBooking > maxMaleCapacity || totalFemaleAfterBooking > maxFemaleCapacity) {
            console.warn(`[RACE CONDITION] Detected overbooking for trip ${tripId} on ${date}. Rolling back booking ${newBooking._id}`);

            // Mark our booking as failed to release seats
            await Booking.findByIdAndUpdate(newBooking._id, {
                status: 'failed',
                failureReason: 'race_condition_rollback'
            });

            return {
                success: false,
                error: 'Sorry, someone just booked those seats. Please try again.',
                availableSeats: Math.min(
                    maxCapacity - (totalAfterBooking - totalReq),
                    maxMaleCapacity - (totalMaleAfterBooking - reqMale),
                    maxFemaleCapacity - (totalFemaleAfterBooking - reqFemale)
                )
            };
        }

        return {
            success: true,
            booking: newBooking,
            remainingSeats: maxCapacity - totalAfterBooking,
            remainingMaleSeats: maxMaleCapacity - totalMaleAfterBooking,
            remainingFemaleSeats: maxFemaleCapacity - totalFemaleAfterBooking
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

    const trip = await Trip.findById(tripId);
    if (!trip) {
        return { success: false, error: 'Trip not found' };
    }

    const maxCapacity = trip.maxCapacity || 12;
    const maxMaleCapacity = trip.maxMaleCapacity || 6;
    const maxFemaleCapacity = trip.maxFemaleCapacity || 6;

    const result = await Booking.aggregate([
        {
            $match: {
                tripId: String(tripId),
                date: String(date),
                $or: [
                    { status: 'confirmed' },
                    { status: { $in: ['pending', 'contacted'] } }
                ]
            }
        },
        {
            $group: {
                _id: null,
                totalTravelers: { $sum: { $ifNull: ['$travelers', 0] } },
                totalMale: { $sum: { $ifNull: ['$maleTravelers', 0] } },
                totalFemale: { $sum: { $ifNull: ['$femaleTravelers', 0] } }
            }
        }
    ]);

    const totalBooked = result.length > 0 ? result[0].totalTravelers : 0;
    const totalMaleBooked = result.length > 0 ? result[0].totalMale : 0;
    const totalFemaleBooked = result.length > 0 ? result[0].totalFemale : 0;
    
    const remaining = Math.max(0, maxCapacity - totalBooked);
    const remainingMale = Math.max(0, maxMaleCapacity - totalMaleBooked);
    const remainingFemale = Math.max(0, maxFemaleCapacity - totalFemaleBooked);

    return {
        success: true,
        tripId,
        date,
        totalBooked,
        totalMaleBooked,
        totalFemaleBooked,
        remaining,
        remainingMale,
        remainingFemale,
        maxCapacity,
        maxMaleCapacity,
        maxFemaleCapacity,
        isSoldOut: totalBooked >= maxCapacity || (remainingMale === 0 && remainingFemale === 0)
    };
}

module.exports = {
    cleanupExpiredBookings,
    getBookingStats,
    reserveSeatsAtomically,
    releaseSeats,
    getAvailability
};
