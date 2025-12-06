const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  date: { type: String, required: true }, // Keeping as string for simplicity with mock format
  content: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: String },
  authorAvatar: { type: String },
  readTime: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  metaDescription: { type: String },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);