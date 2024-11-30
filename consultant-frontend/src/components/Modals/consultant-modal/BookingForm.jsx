import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import BookingCalendar from './BookingCalendar';
import DocumentUpload from './DocumentUpload';
import NoteSection from './NoteSection';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const BookingForm = ({
  consultant,
  service,
  selectedDate,
  selectedTime,
  documents,
  notes,
  onDateChange,
  onTimeChange,
  onDocumentsChange,
  onNotesChange,
  onSubmit,
  isLoading,
  error,
  onGoogleLogin,
  currentUser,
  isAuthenticated
}) => {
  if (!service) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">Please select a service to proceed with booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Calendar */}
      {isAuthenticated ? (
        <>
          <BookingCalendar
            selectedDate={selectedDate}
            onDateChange={onDateChange}
            selectedTime={selectedTime}
            onTimeChange={onTimeChange}
            availability={service.availableSlots}
          />

          {/* Document Upload */}
          <DocumentUpload
            documents={documents}
            onDocumentsChange={onDocumentsChange}
          />

          {/* Notes Section */}
          <NoteSection
            note={notes}
            setNote={onNotesChange}
          />

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading || !selectedDate || !selectedTime}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                (isLoading || !selectedDate || !selectedTime) && 'opacity-50 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-50 p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    There was an error with your booking
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6">
          <p className="text-gray-500 mb-4">Please sign in to book an appointment</p>
          {onGoogleLogin && (
            <GoogleLogin
              onSuccess={onGoogleLogin}
              onError={() => console.log('Login Failed')}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default BookingForm;
