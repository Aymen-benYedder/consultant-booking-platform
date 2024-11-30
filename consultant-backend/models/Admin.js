import mongoose from 'mongoose';
const adminSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin'],
      required: true,
    },
    activityLogs: [
      {
        action: String,
        description: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
  });
  
  export default mongoose.model('Admin', adminSchema);
  