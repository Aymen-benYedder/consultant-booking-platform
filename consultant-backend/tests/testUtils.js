const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Consultant = require('../models/Consultant');

const mockRedisClient = global.mockRedisClient;

const testData = {
    users: {
        client: {
            email: 'testclient@example.com',
            password: 'password123',
            name: 'Test Client',
            role: 'client'
        },
        consultant: {
            email: 'testconsultant@example.com',
            password: 'password123',
            name: 'Test Consultant',
            role: 'consultant'
        },
        admin: {
            email: 'testadmin@example.com',
            password: 'password123',
            name: 'Test Admin',
            role: 'admin'
        }
    },
    services: [{
        name: 'Test Service',
        description: 'Test service description',
        duration: 60,
        price: 100
    }],
    bookings: [{
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        duration: 60,
        status: 'pending'
    }]
};

const connectTestDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI_TEST);
    } catch (error) {
        console.error('Error connecting to test database:', error);
        throw error;
    }
};

const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
};

const createTestUsers = async () => {
    const users = {};
    
    // Create users
    for (const [role, userData] of Object.entries(testData.users)) {
        users[role] = await User.create(userData);
        
        // Create consultant profile if user is a consultant
        if (role === 'consultant') {
            await Consultant.create({
                userId: users[role]._id,
                specialties: ['Test Specialty'],
                bio: 'Test bio',
                availability: {
                    monday: ['09:00-17:00'],
                    tuesday: ['09:00-17:00'],
                    wednesday: ['09:00-17:00'],
                    thursday: ['09:00-17:00'],
                    friday: ['09:00-17:00']
                }
            });
        }
    }
    
    return users;
};

const generateTestTokens = (users) => {
    const tokens = {};
    for (const [role, user] of Object.entries(users)) {
        tokens[role] = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }
    return tokens;
};

const createTestRequest = (user = null, body = {}, params = {}, query = {}) => ({
    user,
    body,
    params,
    query
});

const createTestResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

module.exports = {
    connectTestDB,
    clearDatabase,
    createTestUsers,
    generateTestTokens,
    createTestRequest,
    createTestResponse,
    mockRedisClient,
    testData
};
