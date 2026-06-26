import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['fresh', 'surplus', 'agro-waste'],
  },
  suggestedUse: {
    type: String,
    required: true,
    enum: [
      'for-sale',
      'discounted-sale',
      'group-sell',
      'animal-feed',
      'composting-biogas',
      'heavy-discount-resale',
    ],
  },
  price: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  harvestDate: { type: Date },
  location: { type: String, required: true },
  images: {
    type: [String],
    validate: [arr => arr.length > 0, 'At least one image is required'],
  },
  status: { type: String, enum: ['active', 'sold', 'expired'], default: 'active' },
}, { timestamps: true });

listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ suggestedUse: 1 });

export default mongoose.model('Listing', listingSchema);
