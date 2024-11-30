/**
 * File Upload Configuration
 * Configures multer middleware for handling file uploads in the application.
 * Includes file type validation, size limits, and storage configuration.
 * 
 * @module config/uploadConfig
 * @requires multer - Middleware for handling multipart/form-data
 * @requires path - Path manipulation utility
 * @requires fs - File system operations
 * 
 * Related Files:
 * - routes/bookingRoutes.js - Uses upload middleware for booking documents
 * - routes/consultantRoutes.js - Uses upload for consultant profile documents
 * - controllers/bookingController.js - Processes uploaded booking documents
 * - controllers/consultantController.js - Handles consultant document uploads
 * - services/fileService.js - File processing utilities
 * 
 * Environment Variables:
 * - UPLOAD_DIR: Custom upload directory (optional, defaults to 'medias/documents')
 * - MAX_FILE_SIZE: Maximum file size in bytes (optional, defaults to 10MB)
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directory if it doesn't exist
const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../medias/documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Storage Configuration
 * Configures how and where files should be stored
 * 
 * Features:
 * - Custom upload directory
 * - Unique filename generation
 * - Original file extension preservation
 * 
 * @constant
 * @type {Object}
 * 
 * Related Components:
 * - services/storageService.js - Additional storage utilities
 * - utils/fileUtils.js - File handling helper functions
 */
const storage = multer.diskStorage({
  // Set the destination directory for uploaded files
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  // Generate unique filename for uploaded files
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

/**
 * File Filter Configuration
 * Validates file types before accepting upload
 * 
 * @function fileFilter
 * @param {Object} req - Express request object
 * @param {Object} file - File object from multer
 * @param {Function} cb - Callback function
 * 
 * Supported File Types:
 * - Documents: PDF, DOC, DOCX, XLS, XLSX
 * - Images: JPEG, JPG, PNG
 * 
 * Security Measures:
 * - MIME type validation
 * - File extension validation
 * - Double validation for security
 * 
 * Related Components:
 * - services/validationService.js - Additional validation utilities
 * - utils/securityUtils.js - Security helper functions
 */
const fileFilter = (req, file, cb) => {
  // List of allowed MIME types
  const allowedTypes = [
    'application/pdf',           // PDF files
    'application/msword',        // DOC files
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.ms-excel',  // XLS files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'image/jpeg',               // JPEG/JPG images
    'image/jpg',                // JPG images
    'image/png'                 // PNG images
  ];
  
  // List of allowed file extensions
  const allowedExtensions = [
    '.pdf',    // PDF documents
    '.doc',    // Word documents (old format)
    '.docx',   // Word documents (new format)
    '.xls',    // Excel spreadsheets (old format)
    '.xlsx',   // Excel spreadsheets (new format)
    '.jpeg',   // JPEG images
    '.jpg',    // JPG images
    '.png'     // PNG images
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Validate both MIME type and file extension
  if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);  // Accept file
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPEG, JPG, and PNG files are allowed.'), false);
  }
};

/**
 * Multer Configuration
 * Configures multer middleware with storage, file filter, and size limits
 * 
 * @constant
 * @type {Object}
 * 
 * Features:
 * - Custom storage configuration
 * - File type filtering
 * - File size limits
 * - Error handling
 * 
 * Usage Examples:
 * ```javascript
 * // Single file upload
 * router.post('/upload', upload.single('document'), handleUpload);
 * 
 * // Multiple files upload
 * router.post('/upload-many', upload.array('documents', 5), handleMultipleUploads);
 * ```
 * 
 * Related Routes:
 * - POST /api/bookings/documents - Booking document upload
 * - POST /api/consultants/documents - Consultant document upload
 */
const uploadConfig = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024 // 10MB file size limit
  }
});

module.exports = uploadConfig;
