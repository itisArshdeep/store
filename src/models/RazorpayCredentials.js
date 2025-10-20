import mongoose from 'mongoose';

const RazorpayCredentialsSchema = new mongoose.Schema({
  keyId: {
    type: String,
    required: true
  },
  keySecret: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  environment: {
    type: String,
    enum: ['test', 'live'],
    default: 'test'
  }
}, {
  timestamps: true
});

// Ensure only one credentials document exists
RazorpayCredentialsSchema.index({}, { unique: true });

export default mongoose.models.RazorpayCredentials || mongoose.model('RazorpayCredentials', RazorpayCredentialsSchema);
