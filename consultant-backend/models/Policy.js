const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultant',
    required: true,
  },
  cancellationPolicy: {
    type: String,
    required: true,
  },
  reschedulePolicy: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Policy', policySchema);
