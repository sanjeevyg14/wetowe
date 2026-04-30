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
  travelers: { type: Number, required: true, min: 1, max: 20 },
  pickupPoint: { type: String, default: '' }, // Boarding/pickup location chosen by the traveller
  totalPrice: { type: Number, required: true },

  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'refunded', 'cancelled', 'expired'],
    default: 'pending',
    index: true // Indexed for status-based queries
  },
  paymentResponse: Object, // Store full response from PhonePe for audit
  failureReason: String, // Reason for failure if applicable

  // Pending booking expiry (15 min from creation)
  pendingExpiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
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
    console.log(`[Booking] Creating pending booking for trip ${this.tripId} on ${this.date} - ${this.travelers} travelers`);
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
        totalTravelers: { $sum: '$travelers' },
        confirmedTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, '$travelers', 0] }
        },
        pendingTravelers: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$travelers', 0] }
        }
      }
    }
  ]);

  if (result.length === 0) {
    return { total: 0, confirmed: 0, pending: 0 };
  }

  return {
    total: result[0].totalTravelers,
    confirmed: result[0].confirmedTravelers,
    pending: result[0].pendingTravelers
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