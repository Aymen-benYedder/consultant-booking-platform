const express = require('express');
const upload = require('../config/uploadConfig');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Upload a single document
router.post('/document', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return the file information
    res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Upload multiple documents (up to 5)
router.post('/documents', protect, upload.array('documents', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    // Return information about all uploaded files
    const filesInfo = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    }));

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: filesInfo
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

module.exports = router;
