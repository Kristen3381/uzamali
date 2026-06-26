import mongoose from 'mongoose';

const buyerPreferenceSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredCategories: {
    type: [String],
    enum: ['fresh', 'surplus', 'agro-waste'],
    default: ['fresh', 'surplus'],
  },
  preferredUses: {
    type: [String],
    enum: [
      'for-sale', 'discounted-sale', 'group-sell',
      'animal-feed', 'composting-biogas', 'heavy-discount-resale',
    ],
    default: ['for-sale'],
  },
  notificationRadius: { type: Number, default: 50 },
}, { timestamps: true });

export default mongoose.model('BuyerPreference', buyerPreferenceSchema);
