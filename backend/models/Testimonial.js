const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  quote: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  avatarUrl: { type: String, required: true }
});

module.exports = mongoose.model('Testimonial', testimonialSchema);