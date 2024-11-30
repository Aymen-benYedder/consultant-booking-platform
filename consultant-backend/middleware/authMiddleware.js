/**
 * Authentication Middleware
 * Provides JWT token verification and role-based authorization middleware.
 * This is the main authentication middleware used across protected routes.
 * 
 * @module middleware/authMiddleware
 * @requires jsonwebtoken
 * @requires models/User
 * 
 * Related Files:
 * - middleware/auth.js - Complementary authentication middleware
 * - routes/authRoutes.js - Uses this middleware for protected routes
 * - routes/adminRoutes.js - Uses protect and authorize for admin routes
 * - routes/consultantRoutes.js - Uses protect for consultant routes
 * - routes/clientRoutes.js - Uses protect for client routes
 * - controllers/authController.js - Generates tokens verified by this middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Main authentication middleware that verifies JWT tokens
 * More detailed error handling compared to auth.js verifyToken
 * 
 * @middleware
 * @function protect
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 * 
 * @example
 * // Used in route files
 * router.get('/protected-route', protect, routeHandler);
 * 
 * Related Components:
 * - models/User.js - Used to fetch user data
 * - config/jwt.js - JWT configuration
 * - services/authService.js - Token generation
 */
const protect = async (req, res, next) => {
  try {
    let token;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    
    if (authHeader && typeof authHeader === 'string') {
      // Handle both "Bearer token" and plain "token" formats
      token = authHeader.startsWith('Bearer ') 
        ? authHeader.split(' ')[1]?.trim() 
        : authHeader.trim();
    }

    if (!token || typeof token !== 'string') {
      return res.status(401).json({ 
        message: 'Not authenticated - Invalid or missing token' 
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded || !decoded.id) {
        return res.status(401).json({ 
          message: 'Invalid token format' 
        });
      }

      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found or token invalid' 
        });
      }

      // Add user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired' 
        });
      }
      return res.status(401).json({ 
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication' 
    });
  }
};

/**
 * Role-based authorization middleware
 * Used in combination with protect middleware to restrict route access based on user roles
 * 
 * @middleware
 * @function authorize
 * @param {...string} roles - Allowed roles for the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Used in route files
 * router.put('/admin-only', protect, authorize('admin'), adminHandler);
 * router.post('/consultant-route', protect, authorize('consultant', 'admin'), consultantHandler);
 * 
 * Related Routes:
 * - routes/adminRoutes.js - Admin-only routes
 * - routes/consultantRoutes.js - Consultant-specific routes
 * - routes/clientRoutes.js - Client-specific routes
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to access this route' 
      });
    }
    next();
  };
};

module.exports = protect;
