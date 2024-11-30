/**
 * Authentication Routes
 * Handles all authentication-related endpoints including Google OAuth login,
 * user session management, and profile retrieval.
 * 
 * @module routes/authRoutes
 * @requires express
 * @requires jsonwebtoken
 * @requires google-auth-library
 * @requires models/User
 * @requires models/Client
 * @requires middleware/authMiddleware
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const Client = require('../models/Client');
const protect = require('../middleware/authMiddleware');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @route POST /api/auth/google/login
 * @description Authenticate user with Google OAuth
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.credential - Google ID token
 * @returns {Object} User data and JWT token
 * @throws {401} Authentication failed
 */
router.post('/google/login', async (req, res) => {
  try {
    const { credential } = req.body;
    
    // Validate Google credential
    if (!credential) {
      return res.status(400).json({ message: 'No credential provided' });
    }

    // Verify Google ID token with Google's OAuth service
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }
    
    // Find existing user or create new one
    let user = await User.findOne({ email: payload.email });
    let isNewUser = false;

    if (!user) {
      // Create new user with Google profile data
      user = await new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        role: 'client' // Default role for new users
      }).save();
      isNewUser = true;
    }

    // Ensure client profile exists
    const existingClient = await Client.findOne({ userId: user._id });
    if (isNewUser || !existingClient) {
      // Create associated client profile
      const newClient = new Client({
        userId: user._id,
        bookings: [] // Initialize empty bookings array
      });
      await newClient.save();
    }
    
    // Generate JWT for authenticated sessions
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Return user data and token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      error: error.message 
    });
  }
});

/**
 * @route GET /api/auth/me
 * @description Get current user's profile
 * @access Private
 * @param {Object} req.user - User object from auth middleware
 * @returns {Object} User profile data
 * @throws {404} User not found
 * @throws {500} Server error
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route POST /api/auth/verify-token
 * @description Verify JWT token and return user data
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.token - JWT token to verify
 * @returns {Object} Token validity and user data
 * @throws {401} Invalid or missing token
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({ valid: true, user });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Invalid token' });
  }
});

module.exports = router;
