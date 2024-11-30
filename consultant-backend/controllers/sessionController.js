/**
 * Session Controller
 * Handles all session-related operations including consultation sessions,
 * video calls, and session notes management.
 * 
 * @module controllers/sessionController
 * @requires models/Session
 * @requires models/Booking
 * @requires models/User
 */

import Session from '../models/Session.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { config } from '../config/config.js';
import twilio from 'twilio';

const twilioClient = twilio(config.twilioAccountSid, config.twilioAuthToken);

/**
 * Creates a new consultation session
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.bookingId - ID of the associated booking
 * @param {string} [req.body.notes] - Initial session notes
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Created session details
 */
export const createSession = async (req, res) => {
  try {
    const { bookingId, notes } = req.body;

    // Verify booking exists and is confirmed
    const booking = await Booking.findById(bookingId)
      .populate('consultantId')
      .populate('clientId');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ 
        message: 'Cannot create session for unconfirmed booking' 
      });
    }

    // Create video room
    const room = await twilioClient.video.rooms.create({
      uniqueName: `session-${bookingId}`,
      type: 'group',
      maxParticipants: 2
    });

    // Create session record
    const session = new Session({
      bookingId,
      consultantId: booking.consultantId._id,
      clientId: booking.clientId._id,
      notes,
      roomSid: room.sid,
      roomName: room.uniqueName,
      status: 'scheduled'
    });

    await session.save();

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error creating session:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Generates a video room token for a session
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.sessionId - ID of the session
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Video room token and details
 */
export const generateRoomToken = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId)
      .populate('consultantId')
      .populate('clientId');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Verify user is participant
    const isParticipant = 
      session.consultantId._id.toString() === req.user._id.toString() ||
      session.clientId._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({ 
        message: 'Not authorized to join this session' 
      });
    }

    // Generate access token
    const accessToken = new twilio.jwt.AccessToken(
      config.twilioAccountSid,
      config.twilioApiKey,
      config.twilioApiSecret,
      { identity: req.user._id.toString() }
    );

    const videoGrant = new twilio.jwt.AccessToken.VideoGrant({
      room: session.roomName
    });
    accessToken.addGrant(videoGrant);

    return res.status(200).json({
      token: accessToken.toJwt(),
      roomName: session.roomName
    });
  } catch (error) {
    console.error('Error generating room token:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Updates session notes
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.sessionId - ID of the session
 * @param {Object} req.body - Request body
 * @param {string} req.body.notes - Updated session notes
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated session
 */
export const updateSessionNotes = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only consultant can update notes
    if (session.consultantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only consultant can update session notes' 
      });
    }

    session.notes = notes;
    session.updatedAt = Date.now();
    await session.save();

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error updating session notes:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Ends a session
 * @async
 * @param {Object} req - Express request object
 * @param {string} req.params.sessionId - ID of the session to end
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Updated session
 */
export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Only consultant can end session
    if (session.consultantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Only consultant can end the session' 
      });
    }

    // End video room
    await twilioClient.video.rooms(session.roomSid).update({
      status: 'completed'
    });

    // Update session status
    session.status = 'completed';
    session.endedAt = Date.now();
    await session.save();

    // Update booking status
    await Booking.findByIdAndUpdate(session.bookingId, {
      status: 'completed'
    });

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error ending session:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Gets session history for a user
 * @async
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array} List of user's sessions
 */
export const getSessionHistory = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { consultantId: req.user._id },
        { clientId: req.user._id }
      ]
    })
    .populate('bookingId')
    .populate('consultantId', 'userId')
    .populate('clientId', 'name email')
    .sort({ createdAt: -1 });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching session history:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
