import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  pickupAddress: { type: String, required: true },
  deliveryAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'in-transit', 'delivered'],
    default: 'pending',
  },
  acceptedAt: Date,
  deliveredAt: Date,
}, { timestamps: true });

export default mongoose.model('Delivery', deliverySchema);
