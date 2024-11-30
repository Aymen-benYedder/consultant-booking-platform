import React, { useState, useEffect, useRef } from 'react';
import { Dialog } from '@headlessui/react';
import { consultantsAPI } from '../../../services/api';
import { useAuth } from '../../../contexts/AppContext';
import ConsultantInfo from './ConsultantInfo';
import BookingForm from './BookingForm';
import LoadingSpinner from '../../LoadingSpinner';
import useBookingStore from '../../../store/bookingStore';

const ConsultantModal = ({ isOpen, onClose, consultantId, initialService = null }) => {
  const [consultant, setConsultant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedService, setSelectedService] = useState(initialService);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [notes, setNotes] = useState('');
  const { user, onGoogleLogin } = useAuth();
  const closeButtonRef = useRef(null);
  const bookingStore = useBookingStore();

  const fetchConsultantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await consultantsAPI.getConsultant(consultantId);
      
      // Transform consultant data while preserving all original fields
      const transformedData = {
        ...data,
        _id: data._id,
        name: data.userId?.name || 'Unknown',
        email: data.userId?.email || '',
        services: data.services?.map(service => ({
          ...service,
          _id: service._id,
          title: service.title || '',
          description: service.description || '',
          pricePerSession: service.pricePerSession || 0,
          sessionDuration: service.sessionDuration || 60,
          availableSlots: service.availableSlots || []
        })) || []
      };
      
      setConsultant(transformedData);

      // If we have an initial service, find and set it
      if (initialService) {
        const service = transformedData.services.find(s => s._id === initialService._id);
        if (service) {
          setSelectedService(service);
        }
      }
    } catch (error) {
      console.error('Error fetching consultant:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (consultantId && isOpen) {
      fetchConsultantData();
    }
  }, [consultantId, isOpen]);

  const handleClose = () => {
    setSelectedService(null);
    setSelectedDate(new Date());
    setSelectedTime(null);
    setDocuments([]);
    setUploadedFiles([]);
    setNotes('');
    onClose();
  };

  // Handle service selection
  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedTime(null); // Reset time when service changes
  };

  // Handle booking creation
  const handleCreateBooking = async () => {
    if (!user) {
      setError('Please log in to book an appointment');
      return;
    }

    if (!selectedService) {
      setError('Please select a service before booking');
      return;
    }

    if (!selectedDate || !selectedTime) {
      setError('Please select a date and time for your appointment');
      return;
    }

    try {
      setLoading(true);
      await bookingStore.createBooking({
        consultantId: consultant._id,
        serviceId: selectedService._id,
        date: selectedDate,
        time: selectedTime,
        documents: uploadedFiles,
        notes
      });
      handleClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Dialog
        open={isOpen}
        onClose={handleClose}
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={closeButtonRef}
      >
        <div className="flex items-center justify-center min-h-screen p-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl">
            <LoadingSpinner />
          </div>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed inset-0 z-50 overflow-y-auto"
      initialFocus={closeButtonRef}
    >
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        
        <div className="relative bg-white rounded-lg max-w-4xl w-full mx-4 shadow-xl">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <Dialog.Title className="text-lg font-medium text-gray-900">
              Book Consultation
            </Dialog.Title>
            <button
              ref={closeButtonRef}
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content */}
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Consultant Info */}
              <div>
                <ConsultantInfo
                  consultant={consultant}
                  selectedService={selectedService}
                  onServiceSelect={handleServiceSelect}
                />
              </div>

              {/* Right Column - Booking Form */}
              <div>
                <BookingForm
                  consultant={consultant}
                  service={selectedService}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  documents={documents}
                  notes={notes}
                  onDateChange={setSelectedDate}
                  onTimeChange={setSelectedTime}
                  onDocumentsChange={setDocuments}
                  onNotesChange={setNotes}
                  onSubmit={handleCreateBooking}
                  isLoading={loading}
                  error={error}
                  onGoogleLogin={onGoogleLogin}
                  currentUser={user}
                  isAuthenticated={!!user}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default ConsultantModal;
