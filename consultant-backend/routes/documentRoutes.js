const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/auth');
const Booking = require('../models/Booking');

const router = express.Router();

// Ensure documents directory exists
const documentsDir = path.join(__dirname, '../medias/documents');
if (!fs.existsSync(documentsDir)) {
    fs.mkdirSync(documentsDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, documentsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/jpg',
            'image/png'
        ];

        const allowedExtensions = [
            '.pdf',
            '.doc',
            '.docx',
            '.xls',
            '.xlsx',
            '.jpeg',
            '.jpg',
            '.png'
        ];

        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, JPEG, and PNG files are allowed.'));
        }
    }
});

// Upload document route
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    try {
        console.log('=== Document Upload Debug ===');
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);
        
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        if (!req.body.bookingId) {
            return res.status(400).json({ message: 'Booking ID is required' });
        }

        // Find the booking
        const booking = await Booking.findById(req.body.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Make paths relative to the media directory
        const relativePath = path.relative(path.join(__dirname, '..'), req.file.path);

        const documentData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            path: relativePath.replace(/\\/g, '/'), // Convert Windows path to URL format
            mimeType: req.file.mimetype,
            size: req.file.size,
            bookingId: req.body.bookingId,
            uploadedBy: req.user._id
        };

        console.log('Document data:', documentData);

        // Add document path to booking
        if (!booking.documents) {
            booking.documents = [];
        }
        booking.documents.push(documentData.path);
        await booking.save();

        console.log('Updated booking:', booking);

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: documentData,
            booking: booking
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

// Upload multiple documents for a booking
router.post('/:bookingId/documents', verifyToken, upload.array('documents', 5), async (req, res) => {
    try {
        console.log('=== Multiple Documents Upload Debug ===');
        console.log('Request files:', req.files);
        console.log('Booking ID:', req.params.bookingId);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        // Find the booking
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Process all uploaded files
        const documents = req.files.map(file => {
            const relativePath = path.relative(path.join(__dirname, '..'), file.path);
            return {
                filename: file.filename,
                originalName: file.originalname,
                path: relativePath.replace(/\\/g, '/'),
                mimeType: file.mimetype,
                size: file.size,
                bookingId: req.params.bookingId,
                uploadedBy: req.user._id
            };
        });

        console.log('Documents data:', documents);

        // Add document paths to booking
        if (!booking.documents) {
            booking.documents = [];
        }
        booking.documents.push(...documents.map(doc => doc.path));
        await booking.save();

        console.log('Updated booking:', booking);

        res.status(201).json({
            message: 'Documents uploaded successfully',
            documents: documents,
            booking: booking
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ message: 'Error uploading documents', error: error.message });
    }
});

module.exports = router;