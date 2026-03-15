const express = require('express');
const router = express.Router();
const Testimonial = require('../models/Testimonial.cjs');
const connectDB = require('../lib/db.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// GET all testimonials (public)
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials.map(t => ({
      id: t._id,
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl,
      isActive: t.isActive !== false
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all testimonials for admin (includes inactive)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials.map(t => ({
      id: t._id,
      name: t.name,
      location: t.location,
      quote: t.quote,
      rating: t.rating,
      avatarUrl: t.avatarUrl,
      isActive: t.isActive !== false,
      createdAt: t.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create testimonial (admin only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, location, quote, rating, avatarUrl } = req.body;

    // Validate required fields
    if (!name || !location || !quote || !rating || !avatarUrl) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate name length
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }

    // Validate location length
    if (location.length < 2 || location.length > 50) {
      return res.status(400).json({ message: 'Location must be between 2 and 50 characters' });
    }

    // Validate quote length
    if (quote.length < 10 || quote.length > 500) {
      return res.status(400).json({ message: 'Quote must be between 10 and 500 characters' });
    }

    // Validate rating (1-5)
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Validate avatarUrl format
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(avatarUrl)) {
      return res.status(400).json({ message: 'Invalid avatar URL format' });
    }

    const testimonial = new Testimonial({
      name,
      location,
      quote,
      rating: ratingNum,
      avatarUrl,
      isActive: true
    });

    const newTestimonial = await testimonial.save();
    res.status(201).json({
      id: newTestimonial._id,
      name: newTestimonial.name,
      location: newTestimonial.location,
      quote: newTestimonial.quote,
      rating: newTestimonial.rating,
      avatarUrl: newTestimonial.avatarUrl,
      isActive: newTestimonial.isActive
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update testimonial (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { name, location, quote, rating, avatarUrl, isActive } = req.body;

    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (name !== undefined) testimonial.name = name;
    if (location !== undefined) testimonial.location = location;
    if (quote !== undefined) testimonial.quote = quote;
    if (rating !== undefined) testimonial.rating = Number(rating);
    if (avatarUrl !== undefined) testimonial.avatarUrl = avatarUrl;
    if (isActive !== undefined) testimonial.isActive = isActive;

    const updatedTestimonial = await testimonial.save();
    res.json({
      id: updatedTestimonial._id,
      name: updatedTestimonial.name,
      location: updatedTestimonial.location,
      quote: updatedTestimonial.quote,
      rating: updatedTestimonial.rating,
      avatarUrl: updatedTestimonial.avatarUrl,
      isActive: updatedTestimonial.isActive
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE testimonial (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    await testimonial.deleteOne();
    res.json({ message: 'Testimonial deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;