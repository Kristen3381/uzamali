import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Listing from './models/Listing.js';
import Order from './models/Order.js';
import Delivery from './models/Delivery.js';
import Message from './models/Message.js';
import BuyerPreference from './models/BuyerPreference.js';

const clearDatabase = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('No MONGO_URI specified in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(uri);
    console.log('Connected successfully.');

    await User.deleteMany({});
    await Listing.deleteMany({});
    await Order.deleteMany({});
    await Delivery.deleteMany({});
    await Message.deleteMany({});
    await BuyerPreference.deleteMany({});

    console.log('✅ Successfully cleared all collections (Users, Listings, Orders, Deliveries, Messages, BuyerPreferences).');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to clear database:', err.message);
    process.exit(1);
  }
};

clearDatabase();
