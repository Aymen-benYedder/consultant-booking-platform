const Service = require('../models/Service');
const Consultant = require('../models/Consultant');
const User = require('../models/User');

// Create a new service
const createService = async (req, res) => {
    try {
        const { title, description, pricePerSession, sessionDuration, specialty } = req.body;

        // Ensure the logged-in user is a consultant
        if (req.user.role !== 'consultant') {
            return res.status(403).json({ message: 'Only consultants can create services' });
        }

        const newService = new Service({
            consultantId: req.user._id,
            name: title,
            description,
            price: pricePerSession,
            duration: sessionDuration,
            category: specialty,
        });

        await newService.save();
        return res.status(201).json(newService);
    } catch (error) {
        console.error('Error creating service:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get a service by ID
const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        return res.status(200).json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all services by consultant
const getServicesByConsultant = async (req, res) => {
    try {
        const services = await Service.find({ consultantId: req.user._id });
        return res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get all services with consultant details
const getServices = async (req, res) => {
    try {
        // First, get all consultants with their services
        const consultants = await Consultant.find()
            .populate('userId', 'name email specialization avatar')
            .lean();

        // Create a map of service descriptions to consultant info
        const serviceMap = new Map();
        consultants.forEach(consultant => {
            consultant.services.forEach(service => {
                serviceMap.set(service.description, {
                    consultantId: consultant._id,
                    userId: consultant.userId,
                    name: service.title,
                    price: service.pricePerSession,
                    duration: service.sessionDuration
                });
            });
        });

        // Get all services
        const services = await Service.find().lean();

        // Update services with their consultant IDs and missing fields
        for (const service of services) {
            const consultantInfo = serviceMap.get(service.description);
            if (consultantInfo) {
                await Service.findByIdAndUpdate(
                    service._id,
                    {
                        consultantId: consultantInfo.consultantId,
                        name: consultantInfo.name,
                        price: consultantInfo.price,
                        duration: consultantInfo.duration
                    }
                );
            }
        }

        // Fetch updated services with populated consultant data
        const updatedServices = await Service.find()
            .populate({
                path: 'consultantId',
                populate: {
                    path: 'userId',
                    select: 'name email specialization avatar'
                }
            })
            .lean();

        // Transform the data to include consultant details
        const transformedServices = updatedServices.map(service => {
            const consultant = service.consultantId;
            const user = consultant?.userId;

            return {
                _id: service._id,
                name: service.name,
                description: service.description,
                price: service.price,
                duration: service.duration,
                category: service.category,
                consultantId: consultant ? {
                    _id: consultant._id,
                    userId: user ? {
                        name: user.name,
                        email: user.email,
                        specialty: user.specialization,
                        avatar: user.avatar
                    } : null
                } : null
            };
        });

        return res.json(transformedServices);
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update a service
const updateService = async (req, res) => {
    try {
        const { title, description, pricePerSession, sessionDuration } = req.body;
        const service = await Service.findOneAndUpdate(
            { _id: req.params.id, consultantId: req.user._id },
            { name: title, description, price: pricePerSession, duration: sessionDuration },
            { new: true }
        );

        if (!service) {
            return res.status(404).json({ message: 'Service not found or not authorized' });
        }

        return res.status(200).json(service);
    } catch (error) {
        console.error('Error updating service:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Delete a service
const deleteService = async (req, res) => {
    try {
        const service = await Service.findOneAndDelete({ _id: req.params.id, consultantId: req.user._id });

        if (!service) {
            return res.status(404).json({ message: 'Service not found or not authorized' });
        }

        return res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get services grouped by specialty
const getServicesGroupedBySpecialty = async (req, res) => {
    try {
        const services = await Service.aggregate([
            {
                $group: {
                    _id: "$category",
                    services: { $push: "$$ROOT" }
                }
            }
        ]);
        return res.status(200).json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createService,
    getServiceById,
    getServicesByConsultant,
    updateService,
    deleteService,
    getServicesGroupedBySpecialty,
    getServices
};
