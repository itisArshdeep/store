import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    id: String,
    name: String,
    basePrice: Number,
    quantity: Number,
    weight: Number,
    price: Number,
    mode: String,
    totalPrice: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    carNumber: {
      type: String,
      default: ''
    },
    instructions: {
      type: String,
      default: ''
    }
  },
  paymentId: {
    type: String,
    default: null
  },
  pickupOTP: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },
  readyAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  forceCompleteReason: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
