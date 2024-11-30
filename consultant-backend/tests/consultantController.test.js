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
const consultantController = require('../controllers/consultantController');
const Consultant = require('../models/Consultant');
const Service = require('../models/Service');

describe('Consultant Controller Tests', () => {
    let testUsers;
    let testTokens;
    let consultant;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        await clearDatabase();
        testUsers = await createTestUsers();
        testTokens = generateTestTokens(testUsers);
        consultant = await Consultant.findOne({ userId: testUsers.consultant._id });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('getConsultantProfile', () => {
        it('should get consultant profile successfully', async () => {
            const req = createTestRequest(testUsers.consultant, {}, { id: consultant._id });
            const res = createTestResponse();

            await consultantController.getConsultantProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    consultant: expect.objectContaining({
                        specialization: 'Test Specialization',
                        experience: 5
                    })
                })
            );
        });

        it('should return 404 for non-existent consultant', async () => {
            const req = createTestRequest(testUsers.consultant, {}, { id: new mongoose.Types.ObjectId() });
            const res = createTestResponse();

            await consultantController.getConsultantProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateConsultantProfile', () => {
        it('should update consultant profile successfully', async () => {
            const updateData = {
                specialization: 'Updated Specialization',
                experience: 10,
                rate: 200
            };

            const req = createTestRequest(testUsers.consultant, updateData, { id: consultant._id });
            const res = createTestResponse();

            await consultantController.updateConsultantProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    consultant: expect.objectContaining(updateData)
                })
            );

            // Verify database update
            const updatedConsultant = await Consultant.findById(consultant._id);
            expect(updatedConsultant.specialization).toBe(updateData.specialization);
            expect(updatedConsultant.experience).toBe(updateData.experience);
        });

        it('should return 403 when non-owner tries to update profile', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: consultant._id });
            const res = createTestResponse();

            await consultantController.updateConsultantProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getConsultantServices', () => {
        it('should get consultant services successfully', async () => {
            // Create test services
            await Service.create({
                ...testData.services[0],
                consultantId: consultant._id
            });

            const req = createTestRequest(testUsers.consultant, {}, { id: consultant._id });
            const res = createTestResponse();

            await consultantController.getConsultantServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    services: expect.arrayContaining([
                        expect.objectContaining({
                            name: testData.services[0].name,
                            price: testData.services[0].price
                        })
                    ])
                })
            );
        });
    });

    describe('updateConsultantServices', () => {
        it('should update consultant services successfully', async () => {
            const newService = testData.services[0];
            const req = createTestRequest(testUsers.consultant, { services: [newService] });
            const res = createTestResponse();

            await consultantController.updateConsultantServices(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const services = await Service.find({ consultantId: consultant._id });
            expect(services).toHaveLength(1);
            expect(services[0].name).toBe(newService.name);
        });

        it('should return 403 when non-consultant tries to update services', async () => {
            const req = createTestRequest(testUsers.client, { services: [] });
            const res = createTestResponse();

            await consultantController.updateConsultantServices(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getConsultantAvailability', () => {
        it('should get consultant availability successfully', async () => {
            const availability = {
                monday: ['09:00-17:00'],
                tuesday: ['09:00-17:00']
            };
            await Consultant.findByIdAndUpdate(consultant._id, { availability });

            const req = createTestRequest(testUsers.consultant, {}, { id: consultant._id });
            const res = createTestResponse();

            await consultantController.getConsultantAvailability(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    availability
                })
            );
        });
    });

    describe('updateConsultantAvailability', () => {
        it('should update consultant availability successfully', async () => {
            const availability = {
                monday: ['10:00-18:00'],
                wednesday: ['09:00-17:00']
            };

            const req = createTestRequest(testUsers.consultant, { availability });
            const res = createTestResponse();

            await consultantController.updateConsultantAvailability(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const updatedConsultant = await Consultant.findById(consultant._id);
            expect(updatedConsultant.availability).toEqual(availability);
        });
    });
});
