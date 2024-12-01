/**
 * Server Entry Point
 * This is the main entry point for the Consultant Booking Platform backend.
 * It initializes the Express application and starts the server.
 * 
 * @module server
 * @requires app - Main Express application configuration
 * @requires dotenv - Environment variable management
 * @requires validateEnv - Environment validation utility
 */

const app = require('./app');
const dotenv = require('dotenv');
const validateEnv = require('./config/validateEnv');

// Load environment variables from .env file
dotenv.config();

// Validate environment variables and get validated config
const env = validateEnv();

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(env.PORT, () => {
    console.log(`Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
  });
}

// Export the Express API
module.exports = app;
