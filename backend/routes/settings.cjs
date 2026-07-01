const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting.cjs');
const { authMiddleware, adminMiddleware } = require('../middleware/auth.cjs');

// Public route: Get setting by key
router.get('/:key', async (req, res) => {
    try {
        const setting = await SiteSetting.findOne({ key: req.params.key });
        if (!setting) {
            return res.status(404).json({ message: 'Setting not found' });
        }
        res.json(setting);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Admin route: Update or Create setting by key
router.put('/:key', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { value, description } = req.body;
        
        let setting = await SiteSetting.findOne({ key: req.params.key });
        
        if (setting) {
            setting.value = value;
            if (description) setting.description = description;
            await setting.save();
        } else {
            setting = new SiteSetting({
                key: req.params.key,
                value,
                description: description || ''
            });
            await setting.save();
        }
        
        res.json(setting);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
