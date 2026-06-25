const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // Indexed for user queries
  tripId: { type: String, required: true, index: true }, // Indexed for trip queries
  transactionId: { type: String, required: true, unique: true }, // Merchant Transaction ID

  // Snapshot of Trip Details
  tripTitle: String,
  tripImage: String,

  // Customer Details
  customerName: String,
  email: { type: String, index: true }, // Indexed for lookups
  phone: String,

  // Booking Meta
  date: { type: String, required: true, index: true }, // Indexed for availability checks
  travelers: { type: Number, min: 1, max: 20 }, // Legacy support
  maleTravelers: { type: Number, default: 0, min: 0 },
  femaleTravelers: { type: Number, default: 0, min: 0 },
  pickupPoint: { type: String, default: '' }, // Boarding/pickup location chosen by the traveller
  totalPrice: { type: Number, required: true },

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'contacted', 'confirmed', 'failed', 'refunded', 'cancelled', 'expired'],
    default: 'pending',
    index: true // Indexed for status-based queries
  },
  paymentResponse: Object, // Store full response from PhonePe for audit
  failureReason: String, // Reason for failure if applicable

  // Pending booking expiry (15 min from creation)
  pendingExpiresAt: {
    type: Date,
    default: null,
    index: true // Indexed for cleanup queries
  },

  // Race condition detection
  seatLockTimestamp: Date,

  // Recovery tracking
  autoRecovered: { type: Boolean, default: false },
  previousStatus: String
}, { timestamps: true });

// Compound index for availability queries (optimized for the most common query)
bookingSchema.index({ tripId: 1, date: 1, status: 1 });

// Compound index for cleanup queries
bookingSchema.index({ status: 1, pendingExpiresAt: 1 });

// Pre-save middleware to validate travelers don't cause overbooking
// Note: This is a last-resort check, the atomic reservation should prevent this
bookingSchema.pre('save', async function (next) {
  if (this.isNew && this.status === 'pending') {
    // Log new pending bookings for debugging
    console.log(`[Booking] Creating pending booking for trip ${this.tripId} on ${this.date} - Male: ${this.maleTravelers}, Female: ${this.femaleTravelers}`);
  }
  next();
});

// Static method to get current bookings for a trip/date
bookingSchema.statics.getCurrentBookings = async function (tripId, date) {
  const now = new Date();

  const result = await this.aggregate([
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
        totalMaleTravelers: { $sum: { $add: [{ $ifNull: ['$maleTravelers', 0] }] } },
        totalFemaleTravelers: { $sum: { $add: [{ $ifNull: ['$femaleTravelers', 0] }] } },
        totalLegacyTravelers: { $sum: { $add: [{ $ifNull: ['$travelers', 0] }] } },
        confirmedMaleTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, { $ifNull: ['$maleTravelers', 0] }, 0] }
        },
        confirmedFemaleTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, { $ifNull: ['$femaleTravelers', 0] }, 0] }
        },
        confirmedLegacyTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, { $ifNull: ['$travelers', 0] }, 0] }
        },
        pendingMaleTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, { $ifNull: ['$maleTravelers', 0] }, 0] }
        },
        pendingFemaleTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, { $ifNull: ['$femaleTravelers', 0] }, 0] }
        },
        pendingLegacyTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, { $ifNull: ['$travelers', 0] }, 0] }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { totalMale: 0, totalFemale: 0, totalLegacy: 0, confirmedMale: 0, confirmedFemale: 0, pendingMale: 0, pendingFemale: 0 };
  }

  return {
    totalMale: result[0].totalMaleTravelers,
    totalFemale: result[0].totalFemaleTravelers,
    totalLegacy: result[0].totalLegacyTravelers,
    confirmedMale: result[0].confirmedMaleTravelers,
    confirmedFemale: result[0].confirmedFemaleTravelers,
    pendingMale: result[0].pendingMaleTravelers,
    pendingFemale: result[0].pendingFemaleTravelers,
  };
};

// Instance method to check if booking is still valid (not expired)
bookingSchema.methods.isStillValid = function () {
  if (this.status !== 'pending') return this.status === 'confirmed';
  return this.pendingExpiresAt > new Date();
};

// Instance method to get time remaining for pending booking
bookingSchema.methods.getTimeRemaining = function () {
  if (this.status !== 'pending') return 0;
  const remaining = this.pendingExpiresAt - new Date();
  return Math.max(0, remaining);
};

module.exports = mongoose.model('Booking', bookingSchema);