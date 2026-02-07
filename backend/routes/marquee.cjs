const express = require('express');
const router = express.Router();
const Marquee = require('../models/Marquee.cjs');
const connectDB = require('../lib/db.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// GET all active marquee items (public)
router.get('/', async (req, res) => {
    try {
        await connectDB();
        const items = await Marquee.find({ isActive: true }).sort({ order: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all marquee items (admin)
router.get('/admin', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await connectDB();
        const items = await Marquee.find().sort({ order: 1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create marquee item (admin)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { text, icon, isActive, order } = req.body;

        // Get highest order if not provided
        let itemOrder = order;
        if (itemOrder === undefined) {
            const lastItem = await Marquee.findOne().sort({ order: -1 });
            itemOrder = lastItem ? lastItem.order + 1 : 0;
        }

        const item = new Marquee({
            text,
            icon: icon || 'Zap',
            isActive: isActive !== false,
            order: itemOrder
        });

        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT update marquee item (admin)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await connectDB();
        const { text, icon, isActive, order } = req.body;

        const updatedItem = await Marquee.findByIdAndUpdate(
            req.params.id,
            { text, icon, isActive, order },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: 'Marquee item not found' });
        }

        res.json(updatedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH toggle marquee item status (admin)
router.patch('/:id/toggle', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await connectDB();
        const item = await Marquee.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ message: 'Marquee item not found' });
        }

        item.isActive = !item.isActive;
        await item.save();

        res.json({ isActive: item.isActive });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE marquee item (admin)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await connectDB();
        const deletedItem = await Marquee.findByIdAndDelete(req.params.id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Marquee item not found' });
        }

        res.json({ message: 'Marquee item deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
