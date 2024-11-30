/**
 * Authentication and Authorization Middleware
 * Provides middleware functions for token verification and role-based access control.
 * 
 * @module middleware/auth
 * @requires jsonwebtoken
 * @requires models/User
 * 
 * Related Files:
 * - routes/authRoutes.js - Uses verifyToken for protecting authentication endpoints
 * - routes/adminRoutes.js - Uses isAdmin for admin-only routes
 * - routes/consultantRoutes.js - Uses isConsultant for consultant-specific routes
 * - routes/clientRoutes.js - Uses isClient for client-specific routes
 * - controllers/authController.js - Generates tokens verified by this middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifies JWT token and attaches user to request object
 * Used by protected routes across the application
 * 
 * @middleware
 * @function verifyToken
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in routes/authRoutes.js
 * router.get('/me', verifyToken, getCurrentUser);
 * 
 * Related Models:
 * - models/User.js - Used to fetch user data after token verification
 */
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

/**
 * Checks if authenticated user has admin role
 * Used to protect admin-only routes
 * 
 * @middleware
 * @function isAdmin
 * @param {Object} req - Express request object with attached user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in routes/adminRoutes.js
 * router.get('/users', verifyToken, isAdmin, getAllUsers);
 * 
 * Related Routes:
 * - routes/adminRoutes.js - All admin routes use this middleware
 */
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Checks if authenticated user has consultant role
 * Used to protect consultant-specific routes
 * 
 * @middleware
 * @function isConsultant
 * @param {Object} req - Express request object with attached user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in routes/consultantRoutes.js
 * router.put('/services', verifyToken, isConsultant, updateServices);
 * 
 * Related Routes:
 * - routes/consultantRoutes.js - Consultant management routes
 * - routes/bookingRoutes.js - Consultant booking operations
 */
const isConsultant = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role !== 'consultant') {
            return res.status(403).json({ message: 'Consultant access required' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Checks if authenticated user has client role
 * Used to protect client-specific routes
 * 
 * @middleware
 * @function isClient
 * @param {Object} req - Express request object with attached user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in routes/clientRoutes.js
 * router.post('/book', verifyToken, isClient, bookService);
 * 
 * Related Routes:
 * - routes/clientRoutes.js - Client profile and booking management
 * - routes/bookingRoutes.js - Client booking operations
 */
const isClient = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Client access required' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Checks if user owns the resource or is an admin
 * Used for operations that require ownership or admin privileges
 * 
 * @middleware
 * @function isOwnerOrAdmin
 * @param {Object} req - Express request object with attached user
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in routes/userRoutes.js
 * router.put('/:id', verifyToken, isOwnerOrAdmin, updateUser);
 * 
 * Related Routes:
 * - routes/userRoutes.js - User profile management
 * - routes/bookingRoutes.js - Booking management
 * - routes/reviewRoutes.js - Review management
 */
const isOwnerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const resourceId = req.params.id;
        
        if (req.user.role === 'admin' || req.user._id.toString() === resourceId) {
            next();
        } else {
            return res.status(403).json({ message: 'Access denied' });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    verifyToken,
    isAdmin,
    isConsultant,
    isClient,
    isOwnerOrAdmin
};
