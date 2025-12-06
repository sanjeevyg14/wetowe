const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Ideally ObjectId ref to User
  tripId: { type: String, required: true }, // Ideally ObjectId ref to Trip
  transactionId: { type: String, required: true, unique: true }, // Merchant Transaction ID
  
  // Snapshot of Trip Details
  tripTitle: String,
  tripImage: String,
  
  // Customer Details
  customerName: String,
  email: String,
  phone: String,
  
  // Booking Meta
  date: String,
  travelers: Number,
  totalPrice: Number,
  
  // Payment Status
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'failed', 'refunded', 'cancelled'], 
    default: 'pending' 
  },
  paymentResponse: Object // Store full response from PhonePe for audit
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);