const mongoose = require('mongoose');

const marqueeSchema = new mongoose.Schema({
    text: { type: String, required: true },
    icon: { type: String, default: 'Zap' }, // Icon name from lucide-react
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('Marquee', marqueeSchema);
