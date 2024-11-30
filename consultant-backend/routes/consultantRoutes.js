/**
 * Consultant Routes
 * Handles all consultant-related endpoints including profile management,
 * service updates, and consultant listings.
 * 
 * @module routes/consultantRoutes
 * @requires express
 * @requires controllers/consultantController
 * @requires middleware/authMiddleware
 */

const express = require('express');
const consultantController = require('../controllers/consultantController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/consultants
 * @description Create a new consultant profile
 * @access Private
 * @param {Object} req.body - Consultant profile data including services and expertise
 * @returns {Object} New consultant profile
 */
router.post('/', authMiddleware, consultantController.createConsultant);

/**
 * @route GET /api/consultants/:id
 * @description Get consultant profile by ID
 * @access Public
 * @param {string} req.params.id - Consultant ID
 * @returns {Object} Consultant profile data
 */
router.get('/:id', consultantController.getConsultantById);

/**
 * @route PUT /api/consultants/services
 * @description Update consultant's services and expertise
 * @access Private
 * @param {Object} req.body - Updated services and expertise information
 * @returns {Object} Updated consultant profile
 */
router.put('/services', authMiddleware, consultantController.updateConsultantServices);

/**
 * @route DELETE /api/consultants/:id
 * @description Delete a consultant profile
 * @access Private
 * @param {string} req.params.id - Consultant ID to delete
 * @returns {Object} Deletion confirmation
 */
router.delete('/:id', authMiddleware, consultantController.deleteConsultant);

/**
 * @route GET /api/consultants
 * @description Get list of all available consultants
 * @access Public
 * @returns {Array} List of consultant profiles
 */
router.get('/', consultantController.getAllConsultants);

/**
 * @route GET /api/consultants/profile
 * @description Get consultant profile
 * @access Private
 * @returns {Object} Consultant profile data
 */
router.get('/profile', authMiddleware, consultantController.getConsultantProfile);

module.exports = router;
