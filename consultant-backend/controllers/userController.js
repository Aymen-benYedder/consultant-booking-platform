const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate a JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};

const userController = {
  // Create a new user (sign-up)
  createUser: async (req, res) => {
    const { email, password, name, role, phoneNumber, specialization, ratePerHour, availability } = req.body;

    try {
      // Check if user with the same email already exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user
      const newUser = new User({
        email,
        password,
        name,
        role,
        phoneNumber,
        specialization,
        ratePerHour,
        availability,
      });

      // Hash password before saving the user if it exists
      if (password) {
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
      }

      // Save the user to the database
      await newUser.save();

      // Generate JWT token
      const token = generateToken(newUser);

      return res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name,
          phoneNumber: newUser.phoneNumber,
        },
        token,
      });
    } catch (error) {
      console.error('Error creating user:', error.message); // Log the error message
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // User login
  loginUser: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Use the model's verification method
      const isValid = await user.verifyPassword(password);
      console.log('Password verification result:', isValid);

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user);

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          name: user.name,
          phoneNumber: user.phoneNumber,
        },
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get a user by ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password'); // Exclude password field
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Update user details
  updateUser: async (req, res) => {
    const { name, phoneNumber, specialization, ratePerHour, availability } = req.body;

    try {
      // Find the user and update the fields
      const user = await User.findById(req.params.id);
      if (!user) {
        console.log("user : ",user);
        
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name || user.name;
      user.phoneNumber = phoneNumber || user.phoneNumber;
      user.specialization = specialization || user.specialization;
      user.ratePerHour = ratePerHour || user.ratePerHour;
      user.availability = availability || user.availability;

      await user.save();

      return res.status(200).json({
        message: 'User updated successfully',
        user,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Delete user by ID
  deleteUser: async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  },
};

module.exports = userController;
