const express = require('express');
const router = express.Router();
const TeamMember = require('../models/TeamMember.cjs');
const { requireAuth, requireAdmin } = require('../middleware/auth.cjs');

// Public route: Get all active team members, sorted by order
router.get('/', async (req, res) => {
    try {
        const team = await TeamMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route: Get all team members
router.get('/admin', requireAuth, requireAdmin, async (req, res) => {
    try {
        const team = await TeamMember.find().sort({ order: 1, createdAt: -1 });
        res.json(team);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route: Create a team member
router.post('/', requireAuth, requireAdmin, async (req, res) => {
    try {
        const newMember = new TeamMember(req.body);
        const savedMember = await newMember.save();
        res.status(201).json(savedMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin route: Update a team member
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const updatedMember = await TeamMember.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedMember) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.json(updatedMember);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Admin route: Delete a team member
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndDelete(req.params.id);
        if (!member) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.json({ message: 'Team member deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
