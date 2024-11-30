/**
 * Booking Controller
 * Handles all booking-related operations including creation, retrieval, and management
 * of consultation sessions between clients and consultants.
 * 
 * @module controllers/bookingController
 * @requires models/Booking
 * @requires models/Client
 * @requires models/Consultant
 * @requires models/Service
 * @requires config/uploadConfig
 */

const Booking = require('../models/Booking');
const Client = require('../models/Client');
const Consultant = require('../models/Consultant');
const Service = require('../models/Service');
const upload = require('../config/uploadConfig');
const mongoose = require('mongoose');

/**
 * Creates a new booking for a consultation session
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing booking details
 * @param {string} req.body.consultantId - ID of the consultant to book
 * @param {string} req.body.serviceId - ID of the service being booked
 * @param {string} req.body.date - Date of the booking
 * @param {string} req.body.time - Start time of the session
 * @param {string} req.body.duration - Duration of the session
 * @param {string} [req.body.notes] - Optional notes for the booking
 * @param {string} [req.body.status='pending'] - Booking status
 * @param {string} [req.body.paymentStatus='pending'] - Payment status
 * @param {Object} req.files - Uploaded documents
 * @param {Object} res - Express response object
 * @returns {Object} Created booking object with populated references
 */
const createBooking = async (req, res) => {
  try {
    console.log('=== Booking Request Debug ===');
    console.log('Headers:', req.headers);
    console.log('Raw body:', req.body);

    // Ensure request body is present
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('Empty request body received');
      return res.status(400).json({
        message: 'No booking data provided',
        error: 'Request body is empty'
      });
    }

    // Extract booking data matching the model schema
    const bookingData = {
      clientId: req.user._id, // Get client ID from authenticated user
      consultantId: req.body.consultantId,
      serviceId: req.body.serviceId,
      date: req.body.date,
      time: req.body.time,
      duration: req.body.duration || 60,
      notes: req.body.notes || '',
      status: req.body.status || 'pending',
      paymentStatus: req.body.paymentStatus || 'pending'
    };

    console.log('Parsed booking data:', bookingData);

    // Validate required fields according to the model schema
    const validationErrors = [];
    if (!bookingData.consultantId) validationErrors.push('consultantId is required');
    if (!bookingData.serviceId) validationErrors.push('serviceId is required');
    if (!bookingData.date) validationErrors.push('date is required');
    if (!bookingData.time) validationErrors.push('time is required');
    if (!bookingData.duration) validationErrors.push('duration is required');

    if (validationErrors.length > 0) {
      console.error('Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Missing required fields',
        errors: validationErrors,
        receivedData: bookingData
      });
    }

    // Validate data types
    if (!mongoose.Types.ObjectId.isValid(bookingData.consultantId)) {
      return res.status(400).json({ message: 'Invalid consultantId format' });
    }
    if (!mongoose.Types.ObjectId.isValid(bookingData.serviceId)) {
      return res.status(400).json({ message: 'Invalid serviceId format' });
    }

    // Handle document uploads
    const documentPaths = req.files ? req.files.map(file => file.path) : [];

    // Get or create client profile
    let client;
    try {
      client = await Client.findOne({ userId: req.user.id });
      console.log('Found client:', client);
      
      if (!client) {
        console.log('Creating new client for user:', req.user.id);
        client = new Client({
          userId: req.user.id,
          bookings: []
        });
        await client.save();
        console.log('Created new client:', client);
      }
    } catch (error) {
      console.error('Error finding/creating client:', error);
      throw error;
    }

    // Validate consultant exists
    let consultant;
    try {
      consultant = await Consultant.findById(bookingData.consultantId);
      console.log('Found consultant:', consultant);
      
      if (!consultant) {
        console.log('Consultant not found for ID:', bookingData.consultantId);
        return res.status(404).json({ message: 'Consultant not found' });
      }
    } catch (error) {
      console.error('Error finding consultant:', error);
      throw error;
    }

    // Create booking
    try {
      const newBooking = new Booking({
        clientId: client._id,
        consultantId: bookingData.consultantId,
        serviceId: bookingData.serviceId,
        date: new Date(bookingData.date),
        time: bookingData.time,
        duration: bookingData.duration,
        status: bookingData.status,
        paymentStatus: bookingData.paymentStatus,
        notes: bookingData.notes,
        documents: documentPaths
      });

      console.log('Creating new booking:', newBooking);
      await newBooking.save();
      console.log('Booking saved successfully');

      // Populate the booking with related data
      const populatedBooking = await Booking.findById(newBooking._id)
        .populate('clientId')
        .populate('consultantId')
        .populate('serviceId');

      return res.status(201).json({
        message: 'Booking created successfully',
        booking: populatedBooking
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  } catch (error) {
    console.error('createBooking error:', error);
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

/**
 * Retrieves all bookings for the authenticated client
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of client's bookings with populated references
 */
const getClientBookings = async (req, res) => {
  try {
    // First find the client associated with the user
    const client = await Client.findOne({ userId: req.user.id });
    
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Now find bookings using the client's ID
    const bookings = await Booking.find({ clientId: client._id })
      .populate('consultantId')
      .populate('serviceId')
      .sort({ date: -1, time: -1 }); // Sort by date and time, most recent first

    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all bookings for the authenticated consultant
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of consultant's bookings with populated references
 */
const getConsultantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ consultantId: req.user._id })
      .populate('clientId serviceId');
    return res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching consultant bookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a specific booking by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Booking object with populated references
 */
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('clientId consultantId serviceId');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves bookings within a specified date range
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.consultantId - Consultant ID to filter by
 * @param {string} req.query.startDate - Start date of range
 * @param {string} req.query.endDate - End date of range
 * @param {Object} res - Express response object
 * @returns {Array} List of bookings within date range
 */
const getBookingsByDateRange = async (req, res) => {
  try {
    const { consultantId, startDate, endDate } = req.query;

    if (!consultantId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    const bookings = await Booking.find({
      consultantId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a booking's status or payment status
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking ID to update
 * @param {Object} req.body - Update data
 * @param {string} [req.body.status] - New booking status
 * @param {string} [req.body.paymentStatus] - New payment status
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated booking object
 */
const updateBooking = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to update this booking' });
    }

    booking.status = status || booking.status;
    booking.paymentStatus = paymentStatus || booking.paymentStatus;

    await booking.save();
    return res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a booking
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking ID to delete
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error
 */
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Authorization check
    if (booking.clientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You are not authorized to delete this booking' });
    }

    await booking.remove();
    return res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Uploads documents for a specific booking
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Booking ID
 * @param {Array} req.files - Uploaded files
 * @param {Object} res - Express response object
 * @returns {Object} Updated booking with document information
 */
const uploadDocuments = async (req, res) => {
  try {
    console.log('=== Document Upload Debug ===');
    console.log('Booking ID:', req.params.id);
    console.log('Files:', req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: 'No files uploaded',
        error: 'Request must include files'
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({
        message: 'Booking not found',
        error: `No booking found with ID ${req.params.id}`
      });
    }

    // Process uploaded files
    const documents = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    }));

    // Update booking with new documents
    booking.documents = booking.documents || [];
    booking.documents.push(...documents);
    
    const updatedBooking = await booking.save();
    console.log('Updated booking with documents:', updatedBooking);

    res.status(200).json({
      message: 'Documents uploaded successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({
      message: 'Failed to upload documents',
      error: error.message
    });
  }
};

module.exports = {
  createBooking,
  getClientBookings,
  getConsultantBookings,
  getBookingById,
  getBookingsByDateRange,
  updateBooking,
  deleteBooking,
  uploadDocuments
};
