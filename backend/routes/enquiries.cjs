const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry.cjs');
const connectDB = require('../lib/db.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// POST submit new enquiry (Public)
router.post('/', async (req, res) => {
  try {
    await connectDB();
    const enquiry = new Enquiry(req.body);
    const savedEnquiry = await enquiry.save();
    res.status(201).json(savedEnquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
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