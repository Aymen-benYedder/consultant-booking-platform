import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import useEntityStore from './entityStore';

// Create the store
const useBookingStore = create(
  devtools((set, get) => ({
    // UI State
    isLoading: false,
    error: null,
    
    // Selected IDs
    selectedConsultantId: null,
    selectedServiceId: null,
    selectedDate: null,
    selectedTime: null,
    documents: [],
    notes: '',
    
    // Actions
    setConsultant: (consultant) => {
      console.log('setConsultant called with:', consultant);
      if (!consultant) {
        console.log('Clearing consultant selection');
        set({ selectedConsultantId: null });
        return;
      }

      // Normalize consultant data with services
      const entityStore = useEntityStore.getState();
      
      // Add services first
      if (consultant.services) {
        console.log('Adding consultant services:', consultant.services);
        consultant.services.forEach(service => {
          if (service && service._id) {
            entityStore.addService({
              _id: service._id,
              title: service.title || '',
              duration: service.duration || 60,
              price: service.price || 0,
              description: service.description || '',
              category: service.category || ''
            });
          }
        });
      }

      // Then add consultant
      console.log('Adding consultant to entity store:', consultant);
      const consultantId = entityStore.addConsultant(consultant);
      console.log('Setting selectedConsultantId:', consultantId);
      set({ selectedConsultantId: consultantId });
    },

    setService: (service) => {
      console.log('setService called with:', service);
      if (!service) {
        console.log('Clearing service selection');
        set({ 
          selectedServiceId: null,
          selectedTime: null // Reset dependent states
        });
        return;
      }

      const serviceId = useEntityStore.getState().addService(service);
      console.log('Setting selectedServiceId:', serviceId);
      set({ 
        selectedServiceId: serviceId,
        selectedTime: null // Reset dependent states
      });
    },

    setDate: (date) => {
      console.log('Setting date:', date);
      set({ selectedDate: date });
    },

    setTime: (time) => {
      console.log('Setting time:', time);
      set({ selectedTime: time });
    },

    setDocuments: (docs) => {
      console.log('Setting documents:', docs);
      set({ documents: docs });
    },

    setNotes: (notes) => {
      console.log('Setting notes:', notes);
      set({ notes: notes });
    },

    setError: (error) => {
      console.log('Setting error:', error);
      set({ error: error });
    },

    setLoading: (loading) => {
      console.log('Setting loading:', loading);
      set({ isLoading: loading });
    },

    // Reset booking state
    resetBooking: () => {
      console.log('Resetting booking state');
      set({
        selectedConsultantId: null,
        selectedServiceId: null,
        selectedDate: null,
        selectedTime: null,
        documents: [],
        notes: '',
        error: null,
      });
    },

    // Selectors with debug logging
    getSelectedConsultant: () => {
      const state = get();
      const consultant = useEntityStore.getState().getEntity('consultants', state.selectedConsultantId);
      console.log('getSelectedConsultant:', { selectedId: state.selectedConsultantId, consultant });
      return consultant;
    },

    getSelectedService: () => {
      const state = get();
      const service = useEntityStore.getState().getEntity('services', state.selectedServiceId);
      console.log('getSelectedService:', { selectedId: state.selectedServiceId, service });
      return service;
    },

    // Create booking
    createBooking: async (authenticatedFetch) => {
      console.log('Creating booking...');
      const state = get();
      const entityStore = useEntityStore.getState();
      const consultant = entityStore.getEntity('consultants', state.selectedConsultantId);
      const service = entityStore.getEntity('services', state.selectedServiceId);
      const { selectedDate, selectedTime, documents, notes } = state;

      if (!consultant || !service || !selectedDate || !selectedTime) {
        console.log('Missing required booking information');
        set({ error: 'Missing required booking information' });
        return null;
      }

      console.log('Creating booking with:', { consultant, service, selectedDate, selectedTime, documents, notes });
      set({ isLoading: true, error: null });

      try {
        const formData = new FormData();
        formData.append('consultantId', consultant._id);
        formData.append('serviceId', service._id);
        formData.append('date', selectedDate.toISOString());
        formData.append('time', selectedTime);
        formData.append('notes', notes);
        
        // Append documents if any
        documents.forEach((doc, index) => {
          formData.append(`document_${index}`, doc);
        });

        console.log('Sending booking request...');
        const response = await authenticatedFetch('/api/bookings', {
          method: 'POST',
          body: formData,
        });

        console.log('Received booking response:', response);
        const booking = response.data;
        entityStore.addBooking(booking);
        
        return booking;
      } catch (error) {
        console.log('Error creating booking:', error);
        set({ 
          error: error.message || 'Failed to create booking'
        });
        return null;
      } finally {
        console.log('Booking creation complete');
        set({ isLoading: false });
      }
    },
  }))
);

export default useBookingStore;
