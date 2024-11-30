import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { normalize } from 'normalizr';
import * as schemas from './schemas';

// Helper to merge entities
const mergeEntities = (oldEntities, newEntities) => {
  const result = { ...oldEntities };
  Object.keys(newEntities).forEach(key => {
    result[key] = { ...(result[key] || {}), ...newEntities[key] };
  });
  return result;
};

const useEntityStore = create(
  devtools((set, get) => ({
    // Normalized entities
    entities: {
      users: {},
      consultants: {},
      services: {},
      bookings: {},
      availabilitySlots: {},
      reviews: {},
      documents: {},
    },

    // Current user ID
    currentUserId: null,

    // Loading states
    loading: {
      users: false,
      consultants: false,
      services: false,
      bookings: false,
    },

    // Error states
    errors: {
      users: null,
      consultants: null,
      services: null,
      bookings: null,
    },

    // Entity actions
    addEntities: (normalizedData) => {
      set(state => ({
        entities: mergeEntities(state.entities, normalizedData.entities)
      }));
    },

    // User actions
    setCurrentUserId: (userId) => 
      set({ currentUserId: userId }),

    getCurrentUserId: () => 
      get().currentUserId,

    addUser: (userData) => {
      const normalized = normalize(userData, schemas.userSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Consultant actions
    addConsultant: (consultantData) => {
      const normalized = normalize(consultantData, schemas.consultantSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    updateConsultant: (consultantId, updates) => {
      const consultant = get().entities.consultants[consultantId];
      if (!consultant) return null;
      
      const updated = { ...consultant, ...updates };
      const normalized = normalize(updated, schemas.consultantSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Service actions
    addService: (serviceData) => {
      const normalized = normalize(serviceData, schemas.serviceSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Booking actions
    addBooking: (bookingData) => {
      const normalized = normalize(bookingData, schemas.bookingSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    updateBooking: (bookingId, updates) => {
      const booking = get().entities.bookings[bookingId];
      if (!booking) return null;
      
      const updated = { ...booking, ...updates };
      const normalized = normalize(updated, schemas.bookingSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Review actions
    addReview: (reviewData) => {
      const normalized = normalize(reviewData, schemas.reviewSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Document actions
    addDocument: (documentData) => {
      const normalized = normalize(documentData, schemas.documentSchema);
      get().addEntities(normalized);
      return normalized.result;
    },

    // Loading state actions
    setLoading: (entityType, isLoading) => 
      set(state => ({
        loading: { ...state.loading, [entityType]: isLoading }
      })),

    // Error state actions
    setError: (entityType, error) => 
      set(state => ({
        errors: { ...state.errors, [entityType]: error }
      })),

    // Selectors
    getEntity: (entityType, id) => 
      get().entities[entityType]?.[id] || null,

    getEntities: (entityType, ids) => 
      (ids || Object.keys(get().entities[entityType] || {}))
        .map(id => get().entities[entityType]?.[id])
        .filter(Boolean),

    // Relationship selectors
    getConsultantServices: (consultantId) => {
      const consultant = get().entities.consultants[consultantId];
      if (!consultant?.services) return [];
      return get().getEntities('services', consultant.services);
    },

    getConsultantReviews: (consultantId) => {
      const consultant = get().entities.consultants[consultantId];
      if (!consultant?.reviews) return [];
      return get().getEntities('reviews', consultant.reviews);
    },

    getBookingDocuments: (bookingId) => {
      const booking = get().entities.bookings[bookingId];
      if (!booking?.documents) return [];
      return get().getEntities('documents', booking.documents);
    },

    // Clear store
    clearStore: () => set({
      entities: {
        users: {},
        consultants: {},
        services: {},
        bookings: {},
        availabilitySlots: {},
        reviews: {},
        documents: {},
      },
      currentUserId: null,
      loading: {
        users: false,
        consultants: false,
        services: false,
        bookings: false,
      },
      errors: {
        users: null,
        consultants: null,
        services: null,
        bookings: null,
      },
    }),
  }))
);

export default useEntityStore;
