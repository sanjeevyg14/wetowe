const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    imageUrl: { type: String, required: true },
    bio: { type: String, required: true },
    linkedin: { type: String },
    instagram: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('TeamMember', teamMemberSchema);
