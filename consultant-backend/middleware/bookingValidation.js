/**
 * Booking Validation Middleware
 * Provides validation for booking-related operations.
 * 
 * @module middleware/bookingValidation
 * @requires mongoose
 */

const mongoose = require('mongoose');

/**
 * Validates booking request data
 * @middleware
 * @function validateBooking
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
const validateBooking = (req, res, next) => {
    console.log('=== Booking Validation Debug ===');
    console.log('Request body:', req.body);

    const { clientId, consultantId, serviceId, date, time, duration } = req.body;

    // Required fields check
    const requiredFields = ['clientId', 'consultantId', 'serviceId', 'date', 'time', 'duration'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: 'Missing required fields',
            fields: missingFields
        });
    }

    // ObjectId validation
    const objectIdFields = ['clientId', 'consultantId', 'serviceId'];
    const invalidIds = objectIdFields.filter(field => !mongoose.Types.ObjectId.isValid(req.body[field]));

    if (invalidIds.length > 0) {
        return res.status(400).json({
            message: 'Invalid ID format',
            fields: invalidIds
        });
    }

    // Date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
    if (!dateRegex.test(date)) {
        return res.status(400).json({
            message: 'Invalid date format. Use YYYY-MM-DD'
        });
    }

    // Time validation
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/; // HH:mm
    if (!timeRegex.test(time)) {
        return res.status(400).json({
            message: 'Invalid time format. Use HH:mm (24-hour)'
        });
    }

    // Duration validation (in minutes)
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0 || durationNum > 480) { // Max 8 hours
        return res.status(400).json({
            message: 'Invalid duration. Must be between 1 and 480 minutes'
        });
    }

    // If all validations pass
    next();
};

module.exports = validateBooking;
