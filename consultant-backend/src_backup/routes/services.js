const express = require('express');
const router = express.Router();
const { cacheMiddleware, clearCache } = require('../middleware/cache');
const { authenticateToken } = require('../middleware/auth');

// Get all services
router.get('/', cacheMiddleware('SERVICES'), async (req, res) => {
    try {
        // Your database query here
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
    }
});

// Get service by ID
router.get('/:id', cacheMiddleware('SERVICES'), async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service' });
    }
});

// Create new service (requires authentication)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        // Clear services cache after creating new service
        await clearCache('*/services*');
        res.status(201).json(service);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
});

// Update service (requires authentication)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        // Clear specific service cache and list cache
        await clearCache('*/services*');
        res.json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
    }
});

// Delete service (requires authentication)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        // Clear service caches
        await clearCache('*/services*');
        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Error deleting service' });
    }
});

module.exports = router;
