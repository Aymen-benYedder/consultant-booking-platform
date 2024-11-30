import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { Client } from './models/Client.js';
import { Consultant } from './models/Consultant.js';
import { Service } from './models/Service.js';
import { Booking } from './models/Booking.js';
import { Admin } from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB connected');
    seedAdminUser();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const seedAdminUser = async () => {
  try {
    // Clear existing admin users
    await User.deleteMany({ role: 'admin' });
    await Admin.deleteMany({});

    console.log('Existing admin data cleared');

    // Create admin user
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      phoneNumber: '+1122334455'
    });

    // Create Admin profile
    await Admin.create({
      userId: adminUser._id,
      role: 'admin',
      activityLogs: [
        { action: 'Seed Data', description: 'Initial admin user created', createdAt: new Date() }
      ]
    });

    console.log('\nAdmin user created successfully:');
    console.log({
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding admin data:', error);
    mongoose.connection.close();
  }
};

export default seedAdminUser;
