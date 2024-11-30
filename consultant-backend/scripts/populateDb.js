import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Consultant from '../models/Consultant.js';

dotenv.config();

const consultants = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_1',
    specialty: 'Business Strategy',
    description: 'Expert in business transformation and strategic planning with over 15 years of experience in Fortune 500 companies.',
    phoneNumber: '+1234567890',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_2',
    specialty: 'Technology Consulting',
    description: 'Former Tech Lead at Google, specialized in digital transformation and enterprise architecture.',
    phoneNumber: '+1234567891',
    avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=300&fit=crop',
  },
  {
    name: 'Emma Rodriguez',
    email: 'emma.rodriguez@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_3',
    specialty: 'Marketing Strategy',
    description: 'Award-winning marketing strategist with expertise in digital marketing and brand development.',
    phoneNumber: '+1234567892',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop',
  },
  {
    name: 'James Anderson',
    email: 'james.anderson@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_4',
    specialty: 'Financial Advisory',
    description: 'Certified Financial Planner with 12+ years experience in investment banking and wealth management.',
    phoneNumber: '+1234567893',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
  },
  {
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_5',
    specialty: 'Human Resources',
    description: 'Senior HR Professional specializing in organizational development and talent acquisition.',
    phoneNumber: '+1234567894',
    avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300&h=300&fit=crop',
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_6',
    specialty: 'Operations Management',
    description: 'Operations excellence expert with experience in lean manufacturing and supply chain optimization.',
    phoneNumber: '+1234567895',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop',
  },
  {
    name: 'Sophie Laurent',
    email: 'sophie.laurent@example.com',
    role: 'consultant',
    googleId: 'sample_google_id_7',
    specialty: 'Leadership Development',
    description: 'Executive coach and leadership trainer with experience working with Fortune 100 CEOs.',
    phoneNumber: '+1234567896',
    avatar: 'https://images.unsplash.com/photo-1598550874175-4d0ef436c909?w=300&h=300&fit=crop',
  },
];

const serviceTemplates = [
  {
    title: 'Strategic Business Planning',
    description: 'Develop comprehensive business strategies aligned with your company\'s vision and goals. Includes market analysis, competitive positioning, and implementation roadmap.',
    pricePerSession: 350,
    sessionDuration: 90,
    specialty: 'Business Strategy',
  },
  {
    title: 'Digital Transformation Consulting',
    description: 'Navigate your organization\'s digital transformation journey with expert guidance on technology adoption, process automation, and change management.',
    pricePerSession: 400,
    sessionDuration: 120,
    specialty: 'Technology Consulting',
  },
  {
    title: 'Marketing Strategy Development',
    description: 'Create data-driven marketing strategies to boost your brand presence and ROI. Includes market research, channel optimization, and performance metrics.',
    pricePerSession: 300,
    sessionDuration: 90,
    specialty: 'Marketing Strategy',
  },
  {
    title: 'Financial Planning & Analysis',
    description: 'Comprehensive financial analysis and planning services including investment strategy, risk assessment, and wealth management solutions.',
    pricePerSession: 450,
    sessionDuration: 120,
    specialty: 'Financial Advisory',
  },
  {
    title: 'HR Strategy Consulting',
    description: 'Transform your HR operations with strategic workforce planning, talent management, and organizational development solutions.',
    pricePerSession: 280,
    sessionDuration: 90,
    specialty: 'Human Resources',
  },
  {
    title: 'Operations Optimization',
    description: 'Streamline your operations through process optimization, supply chain enhancement, and efficiency improvements.',
    pricePerSession: 320,
    sessionDuration: 90,
    specialty: 'Operations Management',
  },
  {
    title: 'Executive Leadership Coaching',
    description: 'One-on-one executive coaching focused on leadership development, strategic thinking, and organizational impact.',
    pricePerSession: 500,
    sessionDuration: 60,
    specialty: 'Leadership Development',
  },
  {
    title: 'Team Performance Workshop',
    description: 'Interactive workshop sessions designed to enhance team cohesion, communication, and performance through practical exercises and strategic planning.',
    pricePerSession: 600,
    sessionDuration: 180,
    specialty: 'Leadership Development',
  },
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Consultant.deleteMany({});
    console.log('Cleared existing data');

    // Create consultants
    const createdUsers = await User.create(consultants);
    console.log('Created consultant users');

    // Create consultant profiles and services
    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];
      
      // Create consultant profile
      const consultant = await Consultant.create({
        userId: user._id,
        services: [], // Will be populated with actual services
      });
      console.log(`Created consultant profile for ${user.name}`);

      // Create 1-2 services for each consultant
      const numServices = Math.floor(Math.random() * 2) + 1;
      const consultantSpecialty = consultants[i].specialty;
      
      // Find service templates matching consultant's specialty
      const matchingServices = serviceTemplates.filter(
        s => s.specialty === consultantSpecialty
      );

      // If no exact match, use any service
      const servicesToUse = matchingServices.length > 0 ? matchingServices : serviceTemplates;

      for (let j = 0; j < numServices; j++) {
        const serviceTemplate = servicesToUse[j % servicesToUse.length];
        const service = await Service.create({
          ...serviceTemplate,
          consultantId: user._id,
        });
        console.log(`Created service: ${service.title}`);

        // Add service to consultant's services array
        consultant.services.push({
          title: service.title,
          description: service.description,
          pricePerSession: service.pricePerSession,
          sessionDuration: service.sessionDuration,
          availableSlots: [], // Add slots if needed
        });
      }

      await consultant.save();
    }

    console.log('Database populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating database:', error);
    process.exit(1);
  }
}

populateDatabase();
