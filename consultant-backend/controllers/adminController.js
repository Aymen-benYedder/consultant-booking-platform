/**
 * Admin Controller
 * Handles all admin-related operations including user management,
 * activity logging, and admin creation.
 * 
 * @module controllers/adminController
 * @requires models/User
 * @requires models/Admin
 */

import User from '../models/User.js';
import Admin from '../models/Admin.js';

/**
 * Creates a new admin user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing admin details
 * @param {string} req.body.userId - ID of the user to be made admin
 * @param {string} req.body.role - Role must be 'admin'
 * @param {Object} res - Express response object
 * @returns {Object} New admin object or error message
 */
const createAdmin = async (req, res) => {
  try {
    const { userId, role } = req.body;

    // Validate admin role
    if (role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const newAdmin = new Admin({
      userId,
      role,
    });

    await newAdmin.save();
    return res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Error creating admin:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Logs an admin activity
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing activity details
 * @param {string} req.body.action - Type of action performed
 * @param {string} req.body.description - Description of the activity
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated admin object with new activity log
 */
const logActivity = async (req, res) => {
  try {
    const { action, description } = req.body;

    const admin = await Admin.findOne({ userId: req.user._id });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    admin.activityLogs.push({ action, description });
    await admin.save();

    return res.status(200).json({ message: 'Activity logged successfully', admin });
  } catch (error) {
    console.error('Error logging activity:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all activity logs for an admin
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of activity logs
 */
const getActivityLogs = async (req, res) => {
  try {
    const admin = await Admin.findOne({ userId: req.user._id });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.status(200).json(admin.activityLogs);
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all admin users
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of all admin users with populated user details
 */
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().populate('userId', 'name email');
    return res.status(200).json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all users in the system
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} List of all users (excluding passwords)
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves a specific user by ID
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to retrieve
 * @param {Object} res - Express response object
 * @returns {Object} User object (excluding password)
 */
const getUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates a user's information
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to update
 * @param {Object} req.body - Updated user data
 * @param {Object} res - Express response object
 * @returns {Object} Updated user object
 */
const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a user from the system
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.id - User ID to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error
 */
const deleteUserByAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export {
  createAdmin,
  logActivity,
  getActivityLogs,
  getAllAdmins,
  getAllUsers,
  getUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
};
