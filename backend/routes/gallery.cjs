const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip.cjs');

// @route   GET /api/gallery
// @desc    Get all unique gallery images from all trips
// @access  Public
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find({}, 'gallery'); // Fetch only the gallery field
    const allImages = trips.flatMap(trip => trip.gallery || []);
    const uniqueImages = [...new Set(allImages)];
    res.json(uniqueImages);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;