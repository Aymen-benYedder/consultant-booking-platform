/**
 * Consultant Authorization Middleware
 * Provides specific middleware for consultant-only routes.
 * This middleware is used in conjunction with the main authentication middleware
 * to ensure only consultants can access certain routes.
 * 
 * @module middleware/consultantMiddleware
 * 
 * Related Files:
 * - middleware/auth.js - Main authentication middleware
 * - middleware/authMiddleware.js - Contains similar role-based checks
 * - routes/consultantRoutes.js - Primary usage of this middleware
 * - routes/bookingRoutes.js - Used for consultant-specific booking operations
 * - controllers/consultantController.js - Controllers protected by this middleware
 * - models/Consultant.js - Consultant model referenced in protected routes
 */

const Consultant = require('../models/Consultant');

/**
 * Middleware to verify consultant role
 * Simpler version of the role check compared to auth.js isConsultant
 * Used specifically for consultant-only routes
 * 
 * @middleware
 * @function consultantMiddleware
 * @param {Object} req - Express request object with attached user from auth middleware
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in consultant routes
 * router.put('/profile', authMiddleware, consultantMiddleware, updateProfile);
 * 
 * Related Components:
 * - services/consultantService.js - Business logic for consultant operations
 * - services/bookingService.js - Booking operations requiring consultant auth
 */
function consultantMiddleware(req, res, next) {
    if (req.user && req.user.role === 'consultant') {
        return next();
    }
    return res.status(403).json({ message: 'Access denied: Consultants only' });
}

module.exports = consultantMiddleware;
