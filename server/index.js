import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import User from './models/User.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;

const seedUsers = async () => {
  try {
    const existing = await User.countDocuments();
    if (existing > 0) {
      console.log(`Database has ${existing} users, skipping seed`);
      return;
    }

    const users = [
      { name: 'John Farmer', email: 'farmer@uzamali.com', phone: '+254711111111', password: 'password123', role: 'farmer', maliPoints: 150, location: 'Kiambu' },
      { name: 'Jane Buyer', email: 'buyer@uzamali.com', phone: '+254722222222', password: 'password123', role: 'buyer', maliPoints: 0, location: 'Nairobi' },
      { name: 'Kevin Courier', email: 'courier@uzamali.com', phone: '+254733333333', password: 'password123', role: 'courier', maliPoints: 0, location: 'Nairobi' },
      { name: 'Admin User', email: 'admin@uzamali.com', phone: '+254744444444', password: 'password123', role: 'admin', maliPoints: 0, location: 'Nairobi' },
    ];

    await User.create(users);
    console.log(`Seeded ${users.length} test users`);
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

  if (usingInMemory) await seedUsers();

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error('Startup error:', err.message);
  process.exit(1);
});
