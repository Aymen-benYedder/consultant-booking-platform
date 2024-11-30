// Import required modules
const mongoose = require('mongoose');

// Define the consultant schema
const consultantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  services: [
    {
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      pricePerSession: {
        type: Number,
        required: true
      },
      sessionDuration: {
        type: Number,
        required: true
      },
      availableSlots: [
        {
          date: {
            type: Date,
            required: true
          },
          timeSlots: [
            {
              startTime: {
                type: String,
                required: true
              },
              endTime: {
                type: String,
                required: true
              },
              isBooked: {
                type: Boolean,
                default: false
              }
            }
          ]
        }
      ]
    }
  ],
}, {
  timestamps: true
});

// Create and export the Consultant model
module.exports = mongoose.model('Consultant', consultantSchema);
