const mongoose = require('mongoose');
const {
    connectTestDB,
    clearDatabase,
    createTestUsers,
    generateTestTokens,
    createTestRequest,
    createTestResponse,
    mockRedisClient
} = require('./testUtils');
const userController = require('../controllers/userController');
const User = require('../models/User');

// Mock Redis client
jest.mock('../middleware/cache', () => ({
    redisClient: mockRedisClient
}));

describe('User Controller Tests', () => {
    let testUsers;
    let testTokens;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        testUsers = await createTestUsers();
        testTokens = generateTestTokens(testUsers);
        
        // Reset Redis mock
        mockRedisClient.get.mockClear();
        mockRedisClient.set.mockClear();
        mockRedisClient.del.mockClear();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('getCurrentUser', () => {
        it('should get current user successfully', async () => {
            const req = createTestRequest(testUsers.client);
            const res = createTestResponse();

            await userController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({
                        email: testUsers.client.email,
                        role: 'client'
                    })
                })
            );
        });

        it('should return 401 when no user in request', async () => {
            const req = createTestRequest();
            const res = createTestResponse();

            await userController.getCurrentUser(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const updateData = {
                name: 'Updated Name',
                phone: '+1234567890'
            };

            const req = createTestRequest(testUsers.client, updateData, { id: testUsers.client._id });
            const res = createTestResponse();

            await userController.updateUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining(updateData)
                })
            );

            // Verify database update
            const updatedUser = await User.findById(testUsers.client._id);
            expect(updatedUser.name).toBe(updateData.name);
            expect(updatedUser.phone).toBe(updateData.phone);
        });

        it('should return 403 when non-owner tries to update profile', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: testUsers.consultant._id });
            const res = createTestResponse();

            await userController.updateUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should allow admin to update any user profile', async () => {
            const updateData = {
                name: 'Admin Updated',
                phone: '+9876543210'
            };

            const req = createTestRequest(testUsers.admin, updateData, { id: testUsers.client._id });
            const res = createTestResponse();

            await userController.updateUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const updatedUser = await User.findById(testUsers.client._id);
            expect(updatedUser.name).toBe(updateData.name);
        });
    });

    describe('getUserProfile', () => {
        it('should get user profile successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: testUsers.client._id });
            const res = createTestResponse();

            // Mock Redis cache miss
            mockRedisClient.get.mockResolvedValue(null);

            await userController.getUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining({
                        email: testUsers.client.email,
                        role: 'client'
                    })
                })
            );
        });

        it('should return cached user profile', async () => {
            const cachedUser = {
                _id: testUsers.client._id,
                email: testUsers.client.email,
                role: 'client'
            };

            // Mock Redis cache hit
            mockRedisClient.get.mockResolvedValue(JSON.stringify(cachedUser));

            const req = createTestRequest(testUsers.client, {}, { id: testUsers.client._id });
            const res = createTestResponse();

            await userController.getUserProfile(req, res);

            expect(mockRedisClient.get).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    user: expect.objectContaining(cachedUser)
                })
            );
        });

        it('should return 404 for non-existent user', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: new mongoose.Types.ObjectId() });
            const res = createTestResponse();

            await userController.getUserProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('deleteUserAccount', () => {
        it('should delete user account successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: testUsers.client._id });
            const res = createTestResponse();

            await userController.deleteUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database deletion
            const deletedUser = await User.findById(testUsers.client._id);
            expect(deletedUser).toBeNull();
        });

        it('should return 403 when non-owner tries to delete account', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: testUsers.consultant._id });
            const res = createTestResponse();

            await userController.deleteUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        it('should allow admin to delete any user account', async () => {
            const req = createTestRequest(testUsers.admin, {}, { id: testUsers.client._id });
            const res = createTestResponse();

            await userController.deleteUserAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database deletion
            const deletedUser = await User.findById(testUsers.client._id);
            expect(deletedUser).toBeNull();
        });
    });

    describe('searchUsers', () => {
        it('should search users successfully', async () => {
            const req = createTestRequest(testUsers.admin, {}, {}, { query: 'test' });
            const res = createTestResponse();

            await userController.searchUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    users: expect.arrayContaining([
                        expect.objectContaining({
                            email: expect.any(String),
                            role: expect.any(String)
                        })
                    ])
                })
            );
        });

        it('should return 403 when non-admin tries to search users', async () => {
            const req = createTestRequest(testUsers.client, {}, {}, { query: 'test' });
            const res = createTestResponse();

            await userController.searchUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
