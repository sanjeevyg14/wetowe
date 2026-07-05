const express = require('express');
const multer = require('multer');
const { r2Storage } = require('../lib/r2.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');
const router = express.Router();

// Configure multer with file size limit (5MB) and file filter
const upload = multer({
  storage: r2Storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific image MIME types
    const ALLOWED_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
    }
  }
});

// Image upload route - Admin only
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    
    // multer-s3 attaches the S3 object 'key' to req.file.key
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl) {
      return res.status(500).json({ message: 'R2_PUBLIC_URL is not configured on the server.' });
    }
    
    // Ensure the publicUrl has no trailing slash and combine with key
    const imageUrl = `${publicUrl.replace(/\/$/, '')}/${req.file.key}`;

    res.status(200).json({
      message: 'Image uploaded successfully',
      imageUrl: imageUrl
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading image', error: error.message });
  }
});

// Error handling for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds 5MB limit' });
    }
  }
  res.status(400).json({ message: error.message });
});

module.exports = router;