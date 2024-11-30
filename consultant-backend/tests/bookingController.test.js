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
const bookingController = require('../controllers/bookingController');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Consultant = require('../models/Consultant');

describe('Booking Controller Tests', () => {
    let testUsers;
    let testTokens;
    let consultant;
    let service;
    let booking;

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

        // Create a test booking
        booking = await Booking.create({
            ...testData.bookings[0],
            clientId: testUsers.client._id,
            consultantId: consultant._id,
            serviceId: service._id
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    describe('createBooking', () => {
        it('should create booking successfully', async () => {
            const bookingData = {
                serviceId: service._id,
                consultantId: consultant._id,
                date: new Date().toISOString().split('T')[0],
                time: '14:00',
                duration: 60
            };

            const req = createTestRequest(testUsers.client, bookingData);
            const res = createTestResponse();

            await bookingController.createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    booking: expect.objectContaining({
                        status: 'pending',
                        time: bookingData.time
                    })
                })
            );
        });

        it('should return 400 for invalid booking time', async () => {
            const bookingData = {
                serviceId: service._id,
                consultantId: consultant._id,
                date: new Date().toISOString().split('T')[0],
                time: '25:00', // Invalid time
                duration: 60
            };

            const req = createTestRequest(testUsers.client, bookingData);
            const res = createTestResponse();

            await bookingController.createBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getBooking', () => {
        it('should get booking successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: booking._id });
            const res = createTestResponse();

            await bookingController.getBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    booking: expect.objectContaining({
                        _id: booking._id,
                        status: booking.status
                    })
                })
            );
        });

        it('should return 404 for non-existent booking', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: new mongoose.Types.ObjectId() });
            const res = createTestResponse();

            await bookingController.getBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    describe('updateBookingStatus', () => {
        it('should update booking status successfully', async () => {
            const updateData = {
                status: 'confirmed'
            };

            const req = createTestRequest(testUsers.consultant, updateData, { id: booking._id });
            const res = createTestResponse();

            await bookingController.updateBookingStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const updatedBooking = await Booking.findById(booking._id);
            expect(updatedBooking.status).toBe(updateData.status);
        });

        it('should return 403 when client tries to confirm booking', async () => {
            const req = createTestRequest(testUsers.client, { status: 'confirmed' }, { id: booking._id });
            const res = createTestResponse();

            await bookingController.updateBookingStatus(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getConsultantBookings', () => {
        it('should get consultant bookings successfully', async () => {
            const req = createTestRequest(testUsers.consultant);
            const res = createTestResponse();

            await bookingController.getConsultantBookings(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookings: expect.arrayContaining([
                        expect.objectContaining({
                            _id: booking._id,
                            consultantId: consultant._id
                        })
                    ])
                })
            );
        });
    });

    describe('getClientBookings', () => {
        it('should get client bookings successfully', async () => {
            const req = createTestRequest(testUsers.client);
            const res = createTestResponse();

            await bookingController.getClientBookings(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    bookings: expect.arrayContaining([
                        expect.objectContaining({
                            _id: booking._id,
                            clientId: testUsers.client._id
                        })
                    ])
                })
            );
        });
    });

    describe('cancelBooking', () => {
        it('should cancel booking successfully', async () => {
            const req = createTestRequest(testUsers.client, {}, { id: booking._id });
            const res = createTestResponse();

            await bookingController.cancelBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            
            // Verify database update
            const cancelledBooking = await Booking.findById(booking._id);
            expect(cancelledBooking.status).toBe('cancelled');
        });

        it('should return 403 when non-owner tries to cancel booking', async () => {
            const otherClient = await createTestUsers().client;
            const req = createTestRequest(otherClient, {}, { id: booking._id });
            const res = createTestResponse();

            await bookingController.cancelBooking(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
