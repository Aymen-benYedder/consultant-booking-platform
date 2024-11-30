const express = require('express');
const router = express.Router();
const { cacheMiddleware } = require('../middleware/cache');
const { authenticateToken } = require('../middleware/auth');

// Get all consultants
router.get('/', cacheMiddleware('CONSULTANTS'), async (req, res) => {
    try {
        // Your database query here
        const consultants = await Consultant.find();
        res.json(consultants);
    } catch (error) {
        console.error('Error fetching consultants:', error);
        res.status(500).json({ message: 'Error fetching consultants' });
    }
});

// Get consultant by ID
router.get('/:id', cacheMiddleware('CONSULTANTS'), async (req, res) => {
    try {
        const consultant = await Consultant.findById(req.params.id);
        if (!consultant) {
            return res.status(404).json({ message: 'Consultant not found' });
        }
        res.json(consultant);
    } catch (error) {
        console.error('Error fetching consultant:', error);
        res.status(500).json({ message: 'Error fetching consultant' });
    }
});

// Create new consultant (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const consultant = new Consultant(req.body);
        await consultant.save();
        // Clear consultants cache after creating new consultant
        await clearCache('*/consultants*');
        res.status(201).json(consultant);
    } catch (error) {
        console.error('Error creating consultant:', error);
        res.status(500).json({ message: 'Error creating consultant' });
    }
});

// Update consultant (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const consultant = await Consultant.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!consultant) {
            return res.status(404).json({ message: 'Consultant not found' });
        }
        // Clear specific consultant cache and list cache
        await clearCache('*/consultants*');
        res.json(consultant);
    } catch (error) {
        console.error('Error updating consultant:', error);
        res.status(500).json({ message: 'Error updating consultant' });
    }
});

// Delete consultant (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const consultant = await Consultant.findByIdAndDelete(req.params.id);
        if (!consultant) {
            return res.status(404).json({ message: 'Consultant not found' });
        }
        // Clear consultant caches
        await clearCache('*/consultants*');
        res.json({ message: 'Consultant deleted successfully' });
    } catch (error) {
        console.error('Error deleting consultant:', error);
        res.status(500).json({ message: 'Error deleting consultant' });
    }
});

module.exports = router;
