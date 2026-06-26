import 'dotenv/config';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User.js';

const users = [
  { name: 'John Farmer', email: 'farmer@uzamali.com', phone: '+254711111111', password: 'password123', role: 'farmer', maliPoints: 150, location: 'Kiambu' },
  { name: 'Jane Buyer', email: 'buyer@uzamali.com', phone: '+254722222222', password: 'password123', role: 'buyer', maliPoints: 0, location: 'Nairobi' },
  { name: 'Kevin Courier', email: 'courier@uzamali.com', phone: '+254733333333', password: 'password123', role: 'courier', maliPoints: 0, location: 'Nairobi' },
  { name: 'Admin User', email: 'admin@uzamali.com', phone: '+254744444444', password: 'password123', role: 'admin', maliPoints: 0, location: 'Nairobi' },
];

try {
  let uri = process.env.MONGO_URI;
  if (!uri) {
    console.log('No MONGO_URI set — starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  console.log('Cleared existing users');

  const created = await User.create(users);
  console.log(`Seeded ${created.length} users:`);
  created.forEach((u) => console.log(`  ${u.name} (${u.email}) — ${u.role} — ${u.maliPoints} pts`));

  await mongoose.disconnect();
  console.log('Done.');
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
}
