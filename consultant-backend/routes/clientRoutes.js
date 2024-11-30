/**
 * Client Routes
 * Handles all client-related endpoints including profile management,
 * booking services, and managing client bookings.
 * 
 * @module routes/clientRoutes
 * @requires express
 * @requires controllers/clientController
 * @requires middleware/authMiddleware
 * @requires middleware/bookingValidation
 * @requires config/uploadConfig
 */

const express = require('express');
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middleware/authMiddleware');
const validateBooking = require('../middleware/bookingValidation');
const upload = require('../config/uploadConfig');

const router = express.Router();

/**
 * @route POST /api/clients
 * @description Create a new client profile
 * @access Private
 * @param {Object} req.body - Client profile data
 * @returns {Object} New client profile
 */
router.post('/', authMiddleware, clientController.createClient);

/**
 * @route GET /api/clients/:id
 * @description Get client profile by ID
 * @access Private
 * @param {string} req.params.id - Client ID
 * @returns {Object} Client profile data
 */
router.get('/:id', authMiddleware, clientController.getClientById);

/**
 * @route POST /api/clients/book
 * @description Book a service with a consultant
 * @access Private
 * @param {Object} req.body - Booking details including consultant and service information
 * @param {Array} req.files - Uploaded documents (max 5)
 * @returns {Object} Booking confirmation
 */
router.post('/book', authMiddleware, validateBooking, upload.array('documents', 5), clientController.bookConsultantService);

/**
 * @route PUT /api/clients/cancel/:bookingId
 * @description Cancel an existing booking
 * @access Private
 * @param {string} req.params.bookingId - Booking ID to cancel
 * @returns {Object} Updated booking status
 */
router.put('/cancel/:bookingId', authMiddleware, clientController.cancelBooking);

/**
 * @route GET /api/clients/bookings
 * @description Get all bookings for the authenticated client
 * @access Private
 * @returns {Array} List of client's bookings
 */
router.get('/bookings', authMiddleware, clientController.getClientBookings);

module.exports = router;
