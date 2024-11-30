/**
 * User Model
 * This is the base model for all users in the system (clients, consultants, and admins).
 * It handles authentication, profile management, and role-based access control.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Role determines user permissions and access levels
  role: {
    type: String,
    required: true,
    enum: ['client', 'consultant', 'admin'], // Restricted to these three roles only
  },
  // Google OAuth ID for authentication
  googleId: {
    type: String,
    required: true,
  },
  // User's email (unique identifier)
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  // User's full name
  name: {
    type: String,
    required: true,
  },
  // Optional contact number
  phoneNumber: {
    type: String,
    trim: true,
  },
  // Profile picture URL (from Google or uploaded)
  avatar: {
    type: String,
  },
  // Consultant-specific fields
  specialization: {
    type: String, // e.g., "Business Strategy", "Marketing", etc.
  },
  ratePerHour: {
    type: Number, // Consultant's hourly rate in default currency
  },
  // Weekly availability schedule for consultants
  availability: [
    {
      day: {
        type: String,
        required: true, // e.g., "Monday", "Tuesday", etc.
      },
      timeSlots: [
        {
          start: {
            type: String, // Time in HH:mm format (24-hour)
            required: true,
          },
          end: {
            type: String, // Time in HH:mm format (24-hour)
            required: true,
          },
        },
      ],
    },
  ],
  // Track consultant earnings (consultant-only)
  totalEarnings: {
    type: Number,
    default: 0,
  },
  // Review system for consultants
  reviews: [
    {
      clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the client who left the review
      },
      rating: {
        type: Number,
        min: 1,
        max: 5, // 5-star rating system
      },
      comment: {
        type: String,
      },
    },
  ],
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to verify password (for non-OAuth authentication)
userSchema.methods.verifyPassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Static method to hash passwords (for non-OAuth authentication)
userSchema.statics.hashPassword = async function(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = mongoose.model('User', userSchema);
