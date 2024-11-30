import { schema } from 'normalizr';

// User schema for both clients and consultants
export const userSchema = new schema.Entity('users', {}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    name: entity.name || '',
    email: entity.email || '',
    role: entity.role || 'client',
    profileImage: entity.profileImage || '',
    specialties: entity.specialties || [],
    bio: entity.bio || '',
  })
});

// Service schema
export const serviceSchema = new schema.Entity('services', {}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    title: entity.title || '',
    duration: entity.duration || 60,
    price: entity.price || 0,
    description: entity.description || '',
    category: entity.category || '',
  })
});

// Availability slot schema
export const availabilitySlotSchema = new schema.Entity('availabilitySlots', {}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    date: entity.date || '',
    startTime: entity.startTime || '',
    endTime: entity.endTime || '',
    isBooked: entity.isBooked || false,
  })
});

// Review schema
export const reviewSchema = new schema.Entity('reviews', {
  user: userSchema,
}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    rating: entity.rating || 0,
    comment: entity.comment || '',
    createdAt: entity.createdAt || new Date().toISOString(),
    userId: entity.userId || entity.user?._id,
  })
});

// Document schema
export const documentSchema = new schema.Entity('documents', {}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    name: entity.name || '',
    url: entity.url || '',
    type: entity.type || '',
    size: entity.size || 0,
    uploadedAt: entity.uploadedAt || new Date().toISOString(),
  })
});

// Consultant schema with nested entities
export const consultantSchema = new schema.Entity('consultants', {
  services: [serviceSchema],
  reviews: [reviewSchema],
  availability: [availabilitySlotSchema],
}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    name: entity.name || '',
    email: entity.email || '',
    phoneNumber: entity.phoneNumber || '',
    profileImage: entity.profileImage || '',
    bio: entity.bio || '',
    specialties: entity.specialties || [],
    expertise: entity.expertise || [],
    location: entity.location || '',
    services: entity.services || [],
    reviews: entity.reviews || [],
    availability: entity.availability || [],
    rating: entity.rating || 0,
  })
});

// Booking schema with all relationships
export const bookingSchema = new schema.Entity('bookings', {
  consultant: consultantSchema,
  service: serviceSchema,
  documents: [documentSchema],
}, {
  idAttribute: (entity) => entity._id || entity.id,
  processStrategy: (entity) => ({
    _id: entity._id || entity.id,
    consultantId: entity.consultantId || entity.consultant?._id,
    serviceId: entity.serviceId || entity.service?._id,
    userId: entity.userId,
    date: entity.date || '',
    time: entity.time || '',
    status: entity.status || 'pending',
    notes: entity.notes || '',
    documents: entity.documents || [],
    createdAt: entity.createdAt || new Date().toISOString(),
  })
});
