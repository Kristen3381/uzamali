import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Grains', 'Legumes', 'Tubers', 'Dairy', 'Agro-waste', 'Other'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: 1,
  },
  harvestDate: {
    type: Date,
    required: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
  },
  sustainable: {
    type: Boolean,
    default: false,
  },
  images: [{
    type: String,
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellerName: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Product', productSchema);
