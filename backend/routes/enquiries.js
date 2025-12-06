const express = require('express');
const router = express.Router();
const Enquiry = require('../models/Enquiry');

// POST submit new enquiry (Public)
router.post('/', async (req, res) => {
  try {
    const enquiry = new Enquiry(req.body);
    const savedEnquiry = await enquiry.save();
    res.status(201).json(savedEnquiry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET all enquiries (Admin)
router.get('/', async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.json(enquiries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update status (Admin)
router.put('/:id/status', async (req, res) => {
    try {
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