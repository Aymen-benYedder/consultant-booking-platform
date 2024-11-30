/**
 * Admin Routes
 * Defines all admin-related routes for the application.
 * All routes require authentication and admin privileges.
 * 
 * @module routes/adminRoutes
 * @requires express
 * @requires controllers/adminController
 * @requires middleware/authMiddleware
 */

import express from 'express';
import {
  createAdmin,
  logActivity,
  getActivityLogs,
  getAllAdmins,
  getAllUsers,
  getUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin
} from '../controllers/adminController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/admin
 * @description Create a new admin user
 * @access Private (Super Admin only)
 */
router.post('/', authMiddleware, createAdmin);

/**
 * @route POST /api/admin/activity
 * @description Log an admin activity
 * @access Private (Admin only)
 */
router.post('/activity', authMiddleware, logActivity);

/**
 * @route GET /api/admin/activity
 * @description Get all activity logs for the logged-in admin
 * @access Private (Admin only)
 */
router.get('/activity', authMiddleware, getActivityLogs);

/**
 * @route GET /api/admin
 * @description Get list of all admin users
 * @access Private (Admin only)
 */
router.get('/', authMiddleware, getAllAdmins);

/**
 * User Management Routes
 */

/**
 * @route GET /api/admin/users
 * @description Get list of all users
 * @access Private (Admin only)
 */
router.get('/users', authMiddleware, getAllUsers);

/**
 * @route GET /api/admin/users/:id
 * @description Get specific user details
 * @access Private (Admin only)
 */
router.get('/users/:id', authMiddleware, getUserByAdmin);

/**
 * @route PUT /api/admin/users/:id
 * @description Update user details
 * @access Private (Admin only)
 */
router.put('/users/:id', authMiddleware, updateUserByAdmin);

/**
 * @route DELETE /api/admin/users/:id
 * @description Delete a user
 * @access Private (Admin only)
 */
router.delete('/users/:id', authMiddleware, deleteUserByAdmin);

export default router;
