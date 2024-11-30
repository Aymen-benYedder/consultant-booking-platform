// Import required modules
const mongoose = require('mongoose');

// Define the client schema
const clientSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  preferences: {
    type: Map,
    of: String,
    default: {}
  },
  bookingHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  ],
  savedConsultants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultant'
    }
  ],
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

// Export the Client model
module.exports = mongoose.model('Client', clientSchema);
