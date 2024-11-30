/**
 * Express Application Configuration
 * Sets up the main Express application with all middleware, routes, and configurations.
 * This file is the core of the backend application, handling all setup and configuration.
 * 
 * @module app
 * @requires express - Web application framework
 * @requires cors - Cross-Origin Resource Sharing middleware
 * @requires express-session - Session middleware
 * @requires passport - Authentication middleware
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const validateEnv = require('./config/validateEnv');
const connectDB = require('./config/db');
require('./auth');
const path = require('path');
const fs = require('fs');
const { redisClient } = require('./middleware/cache');

// Import route handlers
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const consultantRoutes = require('./routes/consultantRoutes');
const clientRoutes = require('./routes/clientRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const policyRoutes = require('./routes/policyRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const documentRoutes = require('./routes/documentRoutes');

// Initialize and validate environment variables
dotenv.config();
validateEnv();

// Establish database connection
connectDB();

const app = express();

// Create required directories for file uploads
const mediaDir = path.join(__dirname, 'media');
const documentsDir = path.join(mediaDir, 'documents');
fs.mkdirSync(documentsDir, { recursive: true });

/**
 * Middleware Configuration
 */

// CORS setup for frontend communication
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration for user authentication
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevents client-side access to cookies
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'sessionId'
}));

// Initialize authentication middleware
app.use(passport.initialize());
app.use(passport.session());

/**
 * Static File Serving
 */
// Serve media files (profile pictures, documents, etc.)
app.use('/media', express.static(path.join(__dirname, 'media')));
app.use('/medias', express.static('medias'));

/**
 * API Routes Configuration
 * All routes are prefixed with /api
 */
app.use('/api/auth', authRoutes);         // Authentication endpoints
app.use('/api/users', userRoutes);        // User management
app.use('/api/consultants', consultantRoutes); // Consultant-specific operations
app.use('/api/clients', clientRoutes);    // Client-specific operations
app.use('/api/bookings', bookingRoutes);  // Booking management
app.use('/api/policies', policyRoutes);   // Policy management
app.use('/api/services', serviceRoutes);  // Service management
app.use('/api/upload', uploadRoutes);     // File upload handling
app.use('/api/documents', documentRoutes); // Document management

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  redisClient.quit();
  process.exit(0);
});

module.exports = app;