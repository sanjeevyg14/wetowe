const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial.cjs');
const connectDB = require('../lib/db.cjs');

// GET all testimonials
router.get('/', async (req, res) => {
  try {
    await connectDB();
    // If empty, return seed data structure (handled in API service fallback or seed script)
    // But ideally we just return what's in DB
    const testimonials = await Testimonial.find();
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create testimonial
router.post('/', async (req, res) => {
  const testimonial = new Testimonial(req.body);
  try {
    await connectDB();
    const newTestimonial = await testimonial.save();
    res.status(201).json(newTestimonial);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;