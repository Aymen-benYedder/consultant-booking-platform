/**
 * Booking Routes
 * Handles all booking-related endpoints including creating bookings,
 * retrieving bookings for clients and consultants, and managing booking documents.
 * 
 * @module routes/bookingRoutes
 * @requires express
 * @requires controllers/bookingController
 * @requires middleware/authMiddleware
 * @requires config/uploadConfig
 * @requires middleware/bookingValidation
 */

const express = require('express');
const bookingController = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');
const upload = require('../config/uploadConfig');
const validateBooking = require('../middleware/bookingValidation');
const path = require('path');
const Booking = require('../models/Booking'); // Assuming Booking model is defined in this file
const verifyToken = require('../middleware/authMiddleware'); // Assuming verifyToken is defined in this file

const router = express.Router();

/**
 * @route POST /api/bookings/book
 * @description Create a new booking with optional document uploads
 * @access Private
 * @param {Object} req.body - Booking details
 * @param {Array} req.files - Uploaded documents (max 5)
 * @returns {Object} New booking data
 */
router.post('/book', protect, validateBooking, upload.array('documents', 5), bookingController.createBooking);

/**
 * @route GET /api/bookings
 * @description Get bookings within a specified date range
 * @access Private
 * @param {Date} req.query.startDate - Start date for booking range
 * @param {Date} req.query.endDate - End date for booking range
 * @returns {Array} List of bookings within date range
 */
router.get('/', protect, bookingController.getBookingsByDateRange);

/**
 * @route GET /api/bookings/client
 * @description Get all bookings for the authenticated client
 * @access Private
 * @returns {Array} List of client's bookings
 */
router.get('/client', protect, bookingController.getClientBookings);

/**
 * @route GET /api/bookings/consultant
 * @description Get all bookings for the authenticated consultant
 * @access Private
 * @returns {Array} List of consultant's bookings
 */
router.get('/consultant', protect, bookingController.getConsultantBookings);

/**
 * @route GET /api/bookings/:id
 * @description Get detailed information for a specific booking
 * @access Private
 * @param {string} req.params.id - Booking ID
 * @returns {Object} Booking details
 */
router.get('/:id', protect, bookingController.getBookingById);

/**
 * @route POST /api/bookings/:id/documents
 * @description Upload documents for a specific booking
 * @access Private
 * @param {string} req.params.id - Booking ID
 * @param {Array} req.files - Uploaded documents
 * @returns {Object} Updated booking with document information
 */
router.post('/:id/documents', verifyToken, upload.array('documents', 5), async (req, res) => {
    try {
        console.log('=== Multiple Documents Upload Debug ===');
        console.log('Request files:', req.files);
        console.log('Booking ID:', req.params.id);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Find the booking
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Process all uploaded files
        const documents = req.files.map(file => {
            const relativePath = path.relative(path.join(__dirname, '..'), file.path);
            return {
                filename: file.filename,
                originalName: file.originalname,
                path: relativePath.replace(/\\/g, '/'),
                mimeType: file.mimetype,
                size: file.size,
                bookingId: req.params.id,
                uploadedBy: req.user._id
            };
        });

        console.log('Documents data:', documents);

        // Add document paths to booking
        if (!booking.documents) {
            booking.documents = [];
        }
        booking.documents.push(...documents.map(doc => doc.path));
        await booking.save();

        console.log('Updated booking:', booking);

        res.status(201).json({
            message: 'Documents uploaded successfully',
            documents: documents,
            booking: booking
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ message: 'Error uploading documents', error: error.message });
    }
});

module.exports = router;
