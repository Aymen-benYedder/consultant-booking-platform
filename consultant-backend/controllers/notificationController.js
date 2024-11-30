/**
 * Notification Controller
 * Handles all notification-related operations including creation,
 * retrieval, status updates, and deletion of notifications.
 * 
 * @module controllers/notificationController
 * @requires models/Notification
 */

import { Notification } from '../models/Notification.js';

/**
 * Creates a new notification
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.userId - ID of user to notify
 * @param {string} req.body.type - Type of notification
 * @param {string} req.body.message - Notification message
 * @param {Object} res - Express response object
 * @returns {Object} Created notification object
 */
export const createNotification = async (req, res) => {
  const { userId, type, message } = req.body;

  try {
    const newNotification = new Notification({
      userId,
      type,
      message,
    });

    await newNotification.save();
    return res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Retrieves all notifications for the authenticated user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of user's notifications sorted by creation date
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Marks a notification as read
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.notificationId - ID of notification to mark as read
 * @param {Object} res - Express response object
 * @returns {Object} Updated notification object
 */
export const markAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Deletes a notification
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.notificationId - ID of notification to delete
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    return res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
