const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');

// GET all approved blogs (Public)
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all blogs (Admin)
router.get('/all', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single blog
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create blog
router.post('/', async (req, res) => {
  const blog = new Blog(req.body);
  try {
    const newBlog = await blog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update status (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const blog = await Blog.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(blog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;