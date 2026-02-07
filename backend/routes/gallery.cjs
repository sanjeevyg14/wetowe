const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery.cjs');
const Trip = require('../models/Trip.cjs');
const authMiddleware = require('../middleware/authMiddleware.cjs');
const connectDB = require('../lib/db.cjs');

// @route   GET /api/gallery
// @desc    Get all gallery images (combines custom gallery + trip galleries)
// @access  Public
router.get('/', async (req, res) => {
  try {
    await connectDB();

    // Get custom gallery images first (admin uploaded)
    const customGallery = await Gallery.find({ isActive: true }).sort({ order: 1 });

    // If custom gallery exists and has images, use those
    if (customGallery.length > 0) {
      const galleryImages = customGallery.map(g => ({
        id: g._id,
        imageUrl: g.imageUrl,
        caption: g.caption
      }));
      return res.json(galleryImages);
    }

    // Fallback: Get all unique gallery images from trips
    const trips = await Trip.find({}, 'gallery');
    const allImages = trips.flatMap(trip => trip.gallery || []);
    const uniqueImages = [...new Set(allImages)].slice(0, 12); // Limit to 12

    // Return as simple URLs for backward compatibility
    res.json(uniqueImages.map(url => ({ imageUrl: url, caption: '' })));
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/gallery/admin
// @desc    Get all gallery images for admin management
// @access  Admin
router.get('/admin', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const gallery = await Gallery.find().sort({ order: 1 });
    const mappedGallery = gallery.map(g => ({
      id: g._id,
      imageUrl: g.imageUrl,
      caption: g.caption,
      order: g.order,
      isActive: g.isActive,
      createdAt: g.createdAt
    }));
    res.json(mappedGallery);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/gallery
// @desc    Add image to gallery
// @access  Admin
router.post('/', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { imageUrl, caption } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    // Get max order
    const lastImage = await Gallery.findOne().sort({ order: -1 });
    const newOrder = lastImage ? lastImage.order + 1 : 0;

    const newImage = new Gallery({
      imageUrl,
      caption: caption || '',
      order: newOrder,
      isActive: true
    });

    await newImage.save();
    res.status(201).json({
      id: newImage._id,
      imageUrl: newImage.imageUrl,
      caption: newImage.caption,
      order: newImage.order,
      isActive: newImage.isActive
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/gallery/:id
// @desc    Update gallery image
// @access  Admin
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { caption, order, isActive } = req.body;
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (caption !== undefined) image.caption = caption;
    if (order !== undefined) image.order = order;
    if (isActive !== undefined) image.isActive = isActive;

    await image.save();
    res.json({
      id: image._id,
      imageUrl: image.imageUrl,
      caption: image.caption,
      order: image.order,
      isActive: image.isActive
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete gallery image
// @access  Admin
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.json({ message: 'Image deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   PUT /api/gallery/reorder
// @desc    Reorder gallery images
// @access  Admin
router.put('/reorder/batch', authMiddleware, async (req, res) => {
  try {
    await connectDB();
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { images } = req.body; // Array of { id, order }

    for (const img of images) {
      await Gallery.findByIdAndUpdate(img.id, { order: img.order });
    }

    res.json({ message: 'Gallery reordered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;