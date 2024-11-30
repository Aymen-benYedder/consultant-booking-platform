import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CalendarIcon, ClockIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const BookingModal = ({ isOpen, onClose, consultant }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [step, setStep] = useState(1);

  const timeSlots = [
    '09:00', '10:00', '11:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00'
  ];

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleBooking = async () => {
    // Implement booking logic here
    try {
      // API call to create booking
      onClose();
      // Show success notification
    } catch (error) {
      // Show error notification
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Book a Consultation
                </Dialog.Title>

                {/* Consultant Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={consultant?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(consultant?.name)}
                    alt={consultant?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{consultant?.name}</h4>
                    <p className="text-sm text-gray-500">{consultant?.specialization}</p>
                  </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-between mb-8">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step >= s
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {s === 1 ? (
                          <CalendarIcon className="w-4 h-4" />
                        ) : s === 2 ? (
                          <ClockIcon className="w-4 h-4" />
                        ) : (
                          <CreditCardIcon className="w-4 h-4" />
                        )}
                      </div>
                      {s < 3 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            step > s ? 'bg-primary' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Step Content */}
                <div className="mt-4">
                  {step === 1 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Select Date</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(7)].map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i + 1);
                          return (
                            <button
                              key={i}
                              onClick={() => handleDateSelect(date)}
                              className={`p-2 text-center rounded-lg hover:bg-primary/5 ${
                                selectedDate?.getDate() === date.getDate()
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-gray-50'
                              }`}
                            >
                              <div className="text-sm font-medium">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className="text-lg font-semibold">
                                {date.getDate()}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Select Time</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((time, i) => (
                          <button
                            key={i}
                            onClick={() => handleTimeSelect(time)}
                            className={`p-2 text-center rounded-lg hover:bg-sky-50 ${
                              selectedTime === time
                                ? 'bg-sky-100 text-sky-600'
                                : 'bg-gray-50'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Confirm Booking</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Date</span>
                          <span className="font-medium">
                            {selectedDate?.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time</span>
                          <span className="font-medium">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-medium">1 hour</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price</span>
                          <span className="font-medium">$150</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      onClick={() => setStep(step - 1)}
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                      step === 3
                        ? 'bg-sky-600 hover:bg-sky-700'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    onClick={step === 3 ? handleBooking : null}
                    disabled={step !== 3}
                  >
                    {step === 3 ? 'Confirm Booking' : 'Next'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BookingModal;
