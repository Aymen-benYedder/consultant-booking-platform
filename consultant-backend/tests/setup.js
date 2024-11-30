// Mock Redis client
const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
    on: jest.fn(),
    connect: jest.fn()
};

// Set up global test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI_TEST = 'mongodb://localhost:27017/consultant-test';
process.env.JWT_SECRET = 'test-secret-key';

// Export mocks
global.mockRedisClient = mockRedisClient;
