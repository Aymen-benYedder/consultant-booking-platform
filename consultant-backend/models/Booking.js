/**
 * Booking Model
 * Handles the scheduling and management of consultation sessions between clients and consultants.
 * Tracks appointment details, payment status, and related documents.
 */

// Import required modules
const mongoose = require('mongoose');

// Define the booking schema
const bookingSchema = new mongoose.Schema({
  // Reference to the client who made the booking
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true,
  },
  // Reference to the consultant being booked
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant', 
    required: true,
  },
  // Reference to the specific service being booked
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service', 
    required: true,
  },
  // Date of the consultation
  date: {
    type: String,
    required: true,
  },
  // Consultation time slot
  time: {
    type: String, 
    required: true,
  },
  // Duration of the consultation
  duration: {
    type: Number,
    required: true,
  },
  // Current status of the booking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  },
  // Optional notes for the consultation
  notes: {
    type: String,
  },
  // Payment tracking
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  // Uploaded documents
  documents: [{
    type: String,
    description: 'Paths to uploaded documents'
  }]
}, {
  timestamps: true
});

// Create and export the Booking model
module.exports = mongoose.model('Booking', bookingSchema);
