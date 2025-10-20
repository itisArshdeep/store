import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  basePrice: {
    type: Number,
    required: true,
    min: 0
  },
  hasWeightPricing: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['snacks', 'sweets', 'pakoda', 'paneer'],
    default: 'snacks'
  },
  image: {
    type: String, // GridFS ObjectId as string
    default: ''
  },
  rating: {
    stars: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isBestseller: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
