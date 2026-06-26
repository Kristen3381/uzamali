import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  courier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  quantity: { type: Number, required: true, min: 1 },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending',
  },
  escrowStatus: {
    type: String,
    enum: [null, 'held', 'released', 'refunded', 'disputed'],
    default: null,
  },
  deliveryMethod: {
    type: String,
    enum: ['courier', 'pickup'],
    required: true,
  },
  deliveryOtp: { type: String, default: null },
  expectedDeliveryDate: { type: Date },
  pickupGps: {
    lat: Number,
    lng: Number,
    timestamp: Date,
  },
  deliveryGps: {
    lat: Number,
    lng: Number,
    timestamp: Date,
  },
  paymentRef: { type: String },
  mpesaCallbackConfirmed: { type: Boolean, default: false },
  commissionPercent: { type: Number, default: 5 },
  courierFee: { type: Number, default: 0 },
}, { timestamps: true });

orderSchema.index({ status: 1 });
orderSchema.index({ escrowStatus: 1 });
orderSchema.index({ farmer: 1, escrowStatus: 1 });
orderSchema.index({ buyer: 1, status: 1 });

export default mongoose.model('Order', orderSchema);
