const express = require('express');
const multer = require('multer');
const { storage } = require('../lib/cloudinary.cjs');
const router = express.Router();

const upload = multer({ storage });

router.post('/', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    res.status(200).json({ 
        message: 'Image uploaded successfully', 
        imageUrl: req.file.path 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

module.exports = router;