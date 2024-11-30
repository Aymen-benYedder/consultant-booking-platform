/**
 * Consultant Controller
 * Handles all consultant-related operations including profile management,
 * service updates, and consultant listings.
 * 
 * @module controllers/consultantController
 * @requires models/Consultant
 * @requires models/User
 */

const Consultant = require('../models/Consultant');
const User = require('../models/User');

/**
 * Creates a new consultant profile for an authenticated user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} [req.body.services] - List of services offered by consultant
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created consultant profile
 */
const createConsultant = async (req, res) => {
  try {
    const { services } = req.body;

    const consultant = new Consultant({
      userId: req.user._id,
      services,
    });

    await consultant.save();
    return res.status(201).json(consultant);
  } catch (error) {
    console.error('Error creating consultant:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a consultant profile by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Consultant ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} Consultant profile with populated user details
 */
const getConsultantById = async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id).populate('userId', 'name email');
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }
    return res.status(200).json(consultant);
  } catch (error) {
    console.error('Error retrieving consultant:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a consultant's services
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {Array} [req.body.services] - Updated list of services
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated consultant profile
 */
const updateConsultantServices = async (req, res) => {
  try {
    const consultant = await Consultant.findOne({ userId: req.user._id });
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    consultant.services = req.body.services || consultant.services;
    await consultant.save();

    return res.status(200).json(consultant);
  } catch (error) {
    console.error('Error updating services:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a consultant profile
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - Consultant ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
const deleteConsultant = async (req, res) => {
  try {
    const consultant = await Consultant.findById(req.params.id);
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }

    await consultant.remove();
    return res.status(200).json({ message: 'Consultant profile removed successfully' });
  } catch (error) {
    console.error('Error deleting consultant:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all consultants with their user details
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of consultants with transformed user details
 */
const getAllConsultants = async (req, res) => {
  try {
    const consultants = await Consultant.find()
      .populate({
        path: 'userId',
        select: 'name email avatar specialty description'
      })
      .lean();

    // Transform data to include user details at top level
    const transformedConsultants = consultants.map(consultant => ({
      _id: consultant._id,
      name: consultant.userId?.name || 'Unknown Consultant',
      email: consultant.userId?.email,
      avatar: consultant.userId?.avatar,
      specialty: consultant.userId?.specialty || consultant.specialty || 'General Consulting',
      description: consultant.userId?.description || consultant.description || 'Professional consultant ready to help.',
      services: consultant.services || [],
      userId: consultant.userId?._id
    }));

    return res.status(200).json(transformedConsultants);
  } catch (error) {
    console.error('Error fetching consultants:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves the authenticated consultant's own profile
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Consultant profile with populated user details
 */
const getConsultantProfile = async (req, res) => {
  try {
    const consultant = await Consultant.findOne({ userId: req.user._id }).populate('userId', 'name email');
    if (!consultant) {
      return res.status(404).json({ message: 'Consultant not found' });
    }
    return res.status(200).json(consultant);
  } catch (error) {
    console.error('Error retrieving consultant:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createConsultant,
  getConsultantById,
  updateConsultantServices,
  deleteConsultant,
  getAllConsultants,
  getConsultantProfile
};
