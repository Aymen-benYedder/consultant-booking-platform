import express from 'express';
import {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new notification
router.post('/', authMiddleware, createNotification);

// Get all notifications for the logged-in user
router.get('/', authMiddleware, getNotifications);

// Mark a notification as read
router.put('/:notificationId/read', authMiddleware, markAsRead);

// Delete a notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

export default router;
