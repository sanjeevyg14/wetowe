const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const mongoose = require('mongoose');

// Helper to slugify text
const slugify = (text) => {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start
    .replace(/-+$/, '');            // Trim - from end
};

// Robust unique slug generator
const generateUniqueSlug = async (title, model, ignoreId = null) => {
  let baseSlug = slugify(title);
  let uniqueSlug = baseSlug;
  let counter = 1;
  
  // Create query object
  const getQuery = (slug) => {
      const query = { slug: slug };
      if (ignoreId) {
          query._id = { $ne: ignoreId };
      }
      return query;
  };

  while (await model.findOne(getQuery(uniqueSlug))) {
    uniqueSlug = `${baseSlug}-${counter}`;
    counter++;
  }
  return uniqueSlug;
}

// GET all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single trip by ID or SLUG
router.get('/:id', async (req, res) => {
  try {
    let trip;
    // Check if valid ObjectId
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      trip = await Trip.findById(req.params.id);
    }
    
    // If not found by ID (or invalid ID), try finding by slug
    if (!trip) {
      trip = await Trip.findOne({ slug: req.params.id });
    }

    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create trip
router.post('/', async (req, res) => {
  try {
    const tripData = req.body;
    
    // Generate or ensure unique slug
    if (!tripData.slug) {
        // If no slug provided, generate from title
        tripData.slug = await generateUniqueSlug(tripData.title, Trip);
    } else {
        // If slug provided, ensure it is unique
        const existing = await Trip.findOne({ slug: tripData.slug });
        if (existing) {
             // If manual slug collision, fallback to uniqueness logic based on manual slug
             tripData.slug = await generateUniqueSlug(tripData.slug, Trip);
        }
    }

    const trip = new Trip(tripData);
    const newTrip = await trip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update trip
router.put('/:id', async (req, res) => {
  try {
    const tripData = req.body;
    
    // Handle slug updates
    if (!tripData.slug && tripData.title) {
        // If slug was cleared, regenerate from title
        tripData.slug = await generateUniqueSlug(tripData.title, Trip, req.params.id);
    } else if (tripData.slug) {
        // If slug provided, ensure uniqueness excluding current doc
        const existing = await Trip.findOne({ slug: tripData.slug, _id: { $ne: req.params.id } });
        if (existing) {
             tripData.slug = await generateUniqueSlug(tripData.slug, Trip, req.params.id);
        }
    }

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, tripData, { new: true });
    res.json(updatedTrip);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE trip
router.delete('/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;