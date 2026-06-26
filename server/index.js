import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import preferenceRoutes from './routes/preferences.js';
import orderRoutes from './routes/orders.js';
import paymentRoutes from './routes/payments.js';
import deliveryRoutes from './routes/deliveries.js';
import adminRoutes from './routes/admin.js';
import User from './models/User.js';
import Listing from './models/Listing.js';
import BuyerPreference from './models/BuyerPreference.js';
import Order from './models/Order.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/products', listingRoutes);
app.use('/api/preferences', preferenceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

const autoDisputeCron = () => {
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);
      const result = await Order.updateMany(
        {
          escrowStatus: 'held',
          expectedDeliveryDate: { $exists: true, $ne: null, $lte: cutoff },
        },
        { escrowStatus: 'disputed' }
      );
      if (result.modifiedCount > 0) {
        console.log(`[AUTO-DISPUTE] Flagged ${result.modifiedCount} orders overdue`);
      }
    } catch (err) {
      console.error('[AUTO-DISPUTE] Error:', err.message);
    }
  }, 60 * 60 * 1000);
  console.log('[AUTO-DISPUTE] Cron started (checks every 60 min)');
};

const seedData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log(`Database has ${userCount} users, skipping seed`);
      return;
    }

    const farmer = await User.create({
      name: 'John Farmer',
      phone: '+254711111111',
      email: 'farmer@uzamali.com',
      password: 'password123',
      role: 'farmer',
      sellerTrustLevel: 'verified',
      maliPoints: 150,
      location: { lat: -1.2921, lng: 36.8219 },
    });

    const buyer = await User.create({
      name: 'Jane Buyer',
      phone: '+254722222222',
      email: 'buyer@uzamali.com',
      password: 'password123',
      role: 'buyer',
      maliPoints: 0,
      location: { lat: -1.2864, lng: 36.8172 },
    });

    await User.create({
      name: 'Kevin Courier',
      phone: '+254733333333',
      email: 'courier@uzamali.com',
      password: 'password123',
      role: 'courier',
      location: { lat: -1.2921, lng: 36.8219 },
    });

    await User.create({
      name: 'Admin User',
      phone: '+254744444444',
      email: 'admin@uzamali.com',
      password: 'password123',
      role: 'admin',
    });

    const tomatoListing = await Listing.create({
      farmer: farmer._id,
      title: 'Fresh Red Tomatoes',
      description: 'Organic vine-ripened tomatoes from Kinangop.',
      category: 'fresh',
      suggestedUse: 'for-sale',
      price: 50,
      unit: 'kg',
      quantity: 100,
      harvestDate: new Date(),
      location: 'Kinangop, Nyandarua',
      images: ['https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=400'],
      status: 'active',
    });

    await Listing.create({
      farmer: farmer._id,
      title: 'Dried Maize Stalks',
      description: 'Excellent for animal feed or composting.',
      category: 'agro-waste',
      suggestedUse: 'animal-feed',
      price: 150,
      unit: 'bundle',
      quantity: 1000,
      location: 'Nakuru',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400'],
      status: 'active',
    });

    await BuyerPreference.create({
      buyer: buyer._id,
      preferredCategories: ['fresh', 'surplus', 'agro-waste'],
      preferredUses: ['for-sale', 'animal-feed'],
      notificationRadius: 100,
    });

    const seedOrder = await Order.create({
      buyer: buyer._id,
      farmer: farmer._id,
      listing: tomatoListing._id,
      quantity: 2,
      totalPrice: 100,
      status: 'confirmed',
      escrowStatus: 'held',
      deliveryMethod: 'courier',
      mpesaCallbackConfirmed: true,
      paymentRef: 'SEED-MOCK-001',
      expectedDeliveryDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
      commissionPercent: 5,
      courierFee: 0,
    });

    console.log('Seeded: 4 users, 2 listings, 1 preference, 1 order');
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

const start = async () => {
  const usingInMemory = !process.env.MONGO_URI;
  let uri = process.env.MONGO_URI;

  if (!uri) {
    console.log('No MONGO_URI set — starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  if (usingInMemory) await seedData();

  autoDisputeCron();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error('Startup error:', err.message);
  process.exit(1);
});
