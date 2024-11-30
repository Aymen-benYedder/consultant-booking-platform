/**
 * Environment Variable Validation
 * Validates and type-checks all required environment variables on application startup.
 * This ensures the application has all necessary configuration before running.
 * 
 * @module config/validateEnv
 * @requires envalid - Environment variable validation library
 * 
 * Related Files:
 * - server.js - Uses this validation on application startup
 * - config/db.js - Uses validated MONGODB_URI
 * - config/uploadConfig.js - Uses optional environment variables
 * - services/authService.js - Uses validated OAuth credentials
 * - middleware/authMiddleware.js - Uses validated session secret
 * 
 * Required Environment Variables:
 * - NODE_ENV: Application environment (development/production/test)
 * - PORT: Server port number (default: 8000)
 * - MONGODB_URI: MongoDB connection string
 * - SESSION_SECRET: Session encryption key
 * - GOOGLE_CLIENT_ID: Google OAuth client ID
 * - GOOGLE_CLIENT_SECRET: Google OAuth client secret
 * - GOOGLE_CALLBACK_URL: Google OAuth callback URL
 * - FRONTEND_URL: Frontend application URL (default: http://localhost:3000)
 * - REDIS_HOST: Redis host (default: localhost)
 * - REDIS_PORT: Redis port (default: 6379)
 * - REDIS_PASSWORD: Redis password (default: '')
 */

const { cleanEnv, str, port } = require('envalid');

/**
 * Validates environment variables against a predefined schema
 * Called during application initialization to ensure proper configuration
 * 
 * @function validateEnv
 * @returns {Object} Cleaned and validated environment variables
 * @throws {Error} If any required variables are missing or invalid
 * 
 * Validation Rules:
 * - All required variables must be present
 * - Variables must match their specified types
 * - Enumerated values must match allowed choices
 * - Default values are used when optional variables are missing
 * 
 * Usage:
 * ```javascript
 * // In server.js
 * const validateEnv = require('./config/validateEnv');
 * const env = validateEnv();
 * ```
 * 
 * Related Components:
 * - services/configService.js - Additional configuration management
 * - utils/envUtils.js - Environment helper functions
 */
const validateEnv = () => {
  return cleanEnv(process.env, {
    // Application environment (development/production/test)
    NODE_ENV: str({ 
      choices: ['development', 'test', 'production'],
      default: 'development',
      desc: 'Application environment',
      example: 'development'
    }),
    
    // Server port number
    PORT: port({ 
      default: 8000,
      desc: 'Port number for the server to listen on',
      example: '8000'
    }),
    
    // MongoDB connection string
    MONGODB_URI: str({
      desc: 'MongoDB connection string',
      example: 'mongodb://localhost:27017/consultant-app'
    }),
    
    // Session secret for cookie encryption
    SESSION_SECRET: str({
      desc: 'Secret key for session management',
      example: 'your-secret-key-here'
    }),
    
    // Google OAuth credentials
    GOOGLE_CLIENT_ID: str({
      desc: 'Google OAuth 2.0 client ID',
      example: 'your-client-id.apps.googleusercontent.com'
    }),
    GOOGLE_CLIENT_SECRET: str({
      desc: 'Google OAuth 2.0 client secret',
      example: 'your-client-secret'
    }),
    GOOGLE_CALLBACK_URL: str({
      desc: 'Google OAuth 2.0 callback URL',
      example: 'http://localhost:8000/auth/google/callback'
    }),
    
    // Frontend application URL
    FRONTEND_URL: str({ 
      default: 'http://localhost:3000',
      desc: 'URL of the frontend application',
      example: 'http://localhost:3000'
    }),
    
    // Redis host
    REDIS_HOST: str({ 
      default: 'localhost',
      desc: 'Redis host',
      example: 'localhost'
    }),
    
    // Redis port
    REDIS_PORT: port({ 
      default: 6379,
      desc: 'Redis port',
      example: '6379'
    }),
    
    // Redis password
    REDIS_PASSWORD: str({ 
      default: '',
      desc: 'Redis password',
      example: ''
    })
  });
};

module.exports = validateEnv;