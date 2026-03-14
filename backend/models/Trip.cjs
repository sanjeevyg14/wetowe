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
  imageUrl: { type: String, required: true }, // Cover/Hero image (recommended: 1920x1080px, 16:9 ratio)
  cardImageUrl: { type: String }, // Card/Thumbnail image (recommended: 800x600px, 4:3 ratio)
  gallery: [String],
  description: { type: String, required: true },
  highlights: [String],
  inclusions: [String],
  exclusions: [String],
  pickupPoints: [String],
  itinerary: [itinerarySchema],
  dates: [String], // Array of date strings for now
  maxCapacity: { type: Number, default: 12 }, // Max travelers per date
  isActive: { type: Boolean, default: true }, // Trip visibility status
  gstPercentage: { type: Number, default: 5 }, // GST tax percentage applied at checkout
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Trip', tripSchema);