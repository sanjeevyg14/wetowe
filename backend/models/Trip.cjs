const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  activities: [String]
});

const tripSchema = new mongoose.Schema({
  slug: { type: String, unique: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviewsCount: { type: Number, default: 0 },
  imageUrl: { type: String, required: true },
  gallery: [String],
  description: { type: String, required: true },
  highlights: [String],
  inclusions: [String],
  exclusions: [String],
  pickupPoints: [String],
  itinerary: [itinerarySchema],
  email: [string],
  dates: [String], // Array of date strings for now
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Trip', tripSchema);