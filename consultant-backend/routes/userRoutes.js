const express = require('express');
const User = require('../models/User.js');
const { verifyToken } = require('../middleware/auth.js');

const router = express.Router();

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in /me route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update current user's profile
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, phoneNumber, specialization, ratePerHour } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (user.role === 'consultant') {
      if (specialization) user.specialization = specialization;
      if (ratePerHour) user.ratePerHour = ratePerHour;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, phoneNumber, specialization, ratePerHour } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure users can only update their own profile
    if (user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update fields
    if (name) user.name = name;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (user.role === 'consultant') {
      if (specialization) user.specialization = specialization;
      if (ratePerHour) user.ratePerHour = ratePerHour;
    }

    await user.save();
    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
