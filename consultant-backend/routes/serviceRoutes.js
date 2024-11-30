const express = require('express');
const { 
    createService, 
    getServiceById, 
    getServicesByConsultant,
    updateService,
    deleteService,
    getServicesGroupedBySpecialty,
    getServices
} = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');
const consultantMiddleware = require('../middleware/consultantMiddleware');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getServiceById);
router.get('/grouped', getServicesGroupedBySpecialty);
router.get('/consultant/:id', getServicesByConsultant);

// Protected routes (require authentication)
router.post('/', [authMiddleware, consultantMiddleware], createService);
router.put('/:id', [authMiddleware, consultantMiddleware], updateService);
router.delete('/:id', [authMiddleware, consultantMiddleware], deleteService);

module.exports = router;