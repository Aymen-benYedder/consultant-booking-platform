const mongoose = require('mongoose');
const {
    connectTestDB,
    clearDatabase,
    createTestUsers,
    generateTestTokens,
    createTestRequest,
    createTestResponse,
    testData
} = require('./testUtils');
const serviceController = require('../controllers/serviceController');
const Service = require('../models/Service');
const Consultant = require('../models/Consultant');

describe('Service Controller Tests', () => {
    let testUsers;
    let testTokens;
    let consultant;
    let service;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        testUsers = await createTestUsers();
        testTokens = generateTestTokens(testUsers);
        consultant = await Consultant.findOne({ userId: testUsers.consultant._id });

        // Create a test service
        service = await Service.create({
            ...testData.services[0],
            consultantId: consultant._id
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('createService', () => {
        it('should create service successfully as consultant', async () => {
            const serviceData = {
                name: 'New Test Service',
                description: 'Test service description',
                duration: 60,
                price: 100
            };

            const req = createTestRequest(testUsers.consultant, serviceData);
            const res = createTestResponse();

            await serviceController.createService(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: expect.objectContaining({
                        name: serviceData.name,
                        price: serviceData.price
                    })
                })
            );
        });

        it('should return 403 when non-consultant tries to create service', async () => {
            const req = createTestRequest(testUsers.client, {});
            const res = createTestResponse();

            await serviceController.createService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getService', () => {
        it('should get service successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: service._id });
            const res = createTestResponse();

            await serviceController.getService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: expect.objectContaining({
                        _id: service._id,
                        name: service.name
                    })
                })
            );
        });

        it('should return 404 for non-existent service', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: new mongoose.Types.ObjectId() });
            const res = createTestResponse();

            await serviceController.getService(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateService', () => {
        it('should update service successfully as owner', async () => {
            const updateData = {
                name: 'Updated Service Name',
                price: 150
            };

            const req = createTestRequest(testUsers.consultant, updateData, { id: service._id });
            const res = createTestResponse();

            await serviceController.updateService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const updatedService = await Service.findById(service._id);
            expect(updatedService.name).toBe(updateData.name);
            expect(updatedService.price).toBe(updateData.price);
        });

        it('should return 403 when non-owner tries to update service', async () => {
            const otherConsultant = await createTestUsers().consultant;
            const req = createTestRequest(otherConsultant, {}, { id: service._id });
            const res = createTestResponse();

            await serviceController.updateService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('deleteService', () => {
        it('should delete service successfully as owner', async () => {
            const req = createTestRequest(testUsers.consultant, {}, { id: service._id });
            const res = createTestResponse();

            await serviceController.deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database deletion
            const deletedService = await Service.findById(service._id);
            expect(deletedService).toBeNull();
        });

        it('should return 403 when non-owner tries to delete service', async () => {
            const otherConsultant = await createTestUsers().consultant;
            const req = createTestRequest(otherConsultant, {}, { id: service._id });
            const res = createTestResponse();

            await serviceController.deleteService(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getConsultantServices', () => {
        it('should get consultant services successfully', async () => {
            const req = createTestRequest(testUsers.consultant);
            const res = createTestResponse();

            await serviceController.getConsultantServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: expect.arrayContaining([
                        expect.objectContaining({
                            _id: service._id,
                            consultantId: consultant._id
                        })
                    ])
                })
            );
        });
    });

    describe('searchServices', () => {
        it('should search services successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, {}, { query: 'test' });
            const res = createTestResponse();

            await serviceController.searchServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: expect.arrayContaining([
                        expect.objectContaining({
                            name: expect.stringContaining('Test')
                        })
                    ])
                })
            );
        });

        it('should return empty array for no matches', async () => {
            const req = createTestRequest(testUsers.client, {}, {}, { query: 'nonexistent' });
            const res = createTestResponse();

            await serviceController.searchServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: []
                })
            );
        });
    });
});
