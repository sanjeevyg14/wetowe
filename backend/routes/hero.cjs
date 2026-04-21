const express = require('express');
const router = express.Router();
const HeroImage = require('../models/HeroImage.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');
const connectDB = require('../lib/db.cjs');

// @route   GET /api/hero
// @desc    Get active hero carousel images (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    await connectDB();
    const images = await HeroImage.find({ isActive: true }).sort({ order: 1 }).limit(10);
    res.json(images.map(img => ({
      id: img._id,
      imageUrl: img.imageUrl,
      caption: img.caption,
      order: img.order
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   GET /api/hero/admin
// @desc    Get all hero images for admin management
// @access  Admin
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const images = await HeroImage.find().sort({ order: 1 });
    res.json(images.map(img => ({
      id: img._id,
      imageUrl: img.imageUrl,
      caption: img.caption,
      order: img.order,
      isActive: img.isActive,
      createdAt: img.createdAt
    })));
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/hero
// @desc    Add hero image
// @access  Admin
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { imageUrl, caption } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL format' });
    }
    let sanitizedCaption = caption || '';
    if (sanitizedCaption.length > 200) {
      return res.status(400).json({ message: 'Caption must be less than 200 characters' });
    }
    const lastImage = await HeroImage.findOne().sort({ order: -1 });
    const newOrder = lastImage ? lastImage.order + 1 : 0;

    const newImage = new HeroImage({
      imageUrl,
      caption: sanitizedCaption,
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

// @route   PUT /api/hero/:id
// @desc    Update hero image (caption, order, isActive)
// @access  Admin
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const { caption, order, isActive } = req.body;
    const image = await HeroImage.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    if (caption !== undefined) {
      if (caption.length > 200) {
        return res.status(400).json({ message: 'Caption must be less than 200 characters' });
      }
      image.caption = caption;
    }
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

// @route   DELETE /api/hero/:id
// @desc    Delete hero image
// @access  Admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await connectDB();
    const image = await HeroImage.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }
    res.json({ message: 'Hero image deleted successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
