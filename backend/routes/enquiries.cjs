const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry.cjs');
const connectDB = require('../lib/db.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// POST submit new enquiry (Public)
router.post('/', async (req, res) => {
  try {
    await connectDB();
    
    const { name, Travellers, phone, traveldate, where, message } = req.body;
    
    // Validate required fields
    if (!name || !Travellers || !phone || !traveldate || !where || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Validate name (alphanumeric and spaces only, 2-50 chars)
    if (name.length < 2 || name.length > 50) {
      return res.status(400).json({ message: 'Name must be between 2 and 50 characters' });
    }
    
    // Validate phone (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(String(phone))) {
      return res.status(400).json({ message: 'Phone number must be 10 digits' });
    }
    
    // Validate date is in future
    const bookingDate = new Date(traveldate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset to start of day for fair comparison
    if (bookingDate < today) {
      return res.status(400).json({ message: 'Travel date must be today or in the future' });
    }
    
    // Validate message length
    if (message.length < 10 || message.length > 500) {
      return res.status(400).json({ message: 'Message must be between 10 and 500 characters' });
    }
    
    const enquiry = new Enquiry(req.body);
    const savedEnquiry = await enquiry.save();
    res.status(201).json(savedEnquiry);
  } catch (err) {
    console.error('Enquiry submission error:', err);
    res.status(400).json({ message: 'Failed to submit enquiry. Please try again.' });
  }
});

// GET all enquiries (Admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update status (Admin only)
router.put('/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { status } = req.body;
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json(enquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;