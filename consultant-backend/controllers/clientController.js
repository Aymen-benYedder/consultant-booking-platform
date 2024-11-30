/**
 * Client Controller
 * Handles all client-related operations including profile management,
 * service booking, and booking management.
 * 
 * @module controllers/clientController
 * @requires models/Client
 * @requires models/Consultant
 * @requires models/Service
 * @requires models/Booking
 */

const Client = require('../models/Client');
const Consultant = require('../models/Consultant');
const Service = require('../models/Service');
const Booking = require('../models/Booking');

/**
 * Creates a new client profile linked to an authenticated user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} [req.body.bookings] - Initial bookings array
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created client profile
 */
const createClient = async (req, res) => {
  try {
    const { bookings } = req.body;

    const newClient = new Client({
      userId: req.user._id,
      bookings,
    });

    await newClient.save();
    return res.status(201).json(newClient);
  } catch (error) {
    console.error('Error creating client:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a client profile by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Client ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Client profile with populated user details
 */
const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('userId', 'name email');
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.status(200).json(client);
  } catch (error) {
    console.error('Error fetching client profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Books a service with a consultant
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Booking details
 * @param {string} req.body.consultantId - ID of consultant to book
 * @param {string} req.body.serviceId - ID of service to book
 * @param {string} req.body.date - Date of booking
 * @param {string} req.body.time - Time of booking
 * @param {string} req.body.duration - Duration of booking
 * @param {Array} req.files - Uploaded documents
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated client profile with new booking
 */
const bookConsultantService = async (req, res) => {
  try {
    console.log('=== Booking Service Debug ===');
    console.log('Request body:', req.body);
    console.log('Uploaded files:', req.files);

    const { consultantId, serviceId, date, time, duration } = req.body;

    // Validate consultant exists
    const consultant = await Consultant.findById(consultantId);
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    // Validate service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get client profile
    const client = await Client.findOne({ userId: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    // Handle document paths
    const documentPaths = req.files ? req.files.map(file => file.path) : [];
    console.log('Document paths:', documentPaths);

    // Create new booking in the Booking collection
    const booking = new Booking({
      clientId: client._id,
      consultantId,
      serviceId,
      date,
      time,
      duration,
      status: 'pending',
      documents: documentPaths
    });

    await booking.save();
    console.log('Booking saved:', booking);

    // Add booking reference to client
    client.bookings.push(booking._id);
    await client.save();

    return res.status(201).json({
      message: 'Booking created successfully',
      booking: await booking.populate(['consultantId', 'serviceId'])
    });
  } catch (error) {
    console.error('Error booking service:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Cancels a client's booking
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.bookingId - ID of booking to cancel
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated client profile
 */
const cancelBooking = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id });
    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    const booking = client.bookings.id(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    await client.save();

    return res.status(200).json(client);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all bookings for a client
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of client's bookings with populated consultant details
 */
const getClientBookings = async (req, res) => {
  try {
    const client = await Client.findOne({ userId: req.user._id })
      .populate({
        path: 'bookings',
        populate: [
          { path: 'consultantId', select: 'userId services' },
          { path: 'serviceId' }
        ]
      });

    if (!client) {
      return res.status(404).json({ message: 'Client profile not found' });
    }

    return res.status(200).json(client.bookings);
  } catch (error) {
    console.error('Error fetching client bookings:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createClient,
  getClientById,
  bookConsultantService,
  cancelBooking,
  getClientBookings
};
