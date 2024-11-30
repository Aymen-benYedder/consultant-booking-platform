import React from 'react';
import { MapPinIcon, PhoneIcon, EnvelopeIcon, StarIcon } from '@heroicons/react/24/outline';

const ConsultantInfo = ({ consultant, selectedService, onServiceSelect }) => {
  if (!consultant) {
    return (
      <div className="text-gray-500">
        No consultant information available
      </div>
    );
  }

  // Extract consultant data with fallbacks
  const {
    name = 'Consultant',
    email = '',
    phoneNumber = '',
    location = 'Remote',
    profileImage = '',
    bio = '',
    specialties = [],
    expertise = [],
    rating = 0,
    services = []
  } = consultant;

  // Generate default avatar if none provided
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=0369a1&color=ffffff`;
  
  // Use the first available image source
  const displayImage = profileImage || defaultImage;

  // Combine specialties and expertise for display
  const displaySpecialties = specialties.length > 0 ? specialties : 
                           expertise.length > 0 ? expertise : 
                           ['General Consulting'];

  return (
    <div className="space-y-6">
      {/* Consultant Profile */}
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <img
            src={displayImage}
            alt={name}
            className="h-32 w-32 rounded-lg object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 truncate">{name}</h2>
          
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-5 w-5 text-gray-400 mr-1.5" aria-hidden="true" />
            {location}
          </div>

          {email && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-1.5" aria-hidden="true" />
              {email}
            </div>
          )}

          {phoneNumber && (
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <PhoneIcon className="h-5 w-5 text-gray-400 mr-1.5" aria-hidden="true" />
              {phoneNumber}
            </div>
          )}

          {rating > 0 && (
            <div className="mt-2 flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">About</h3>
          <p className="mt-2 text-gray-600">{bio}</p>
        </div>
      )}

      {/* Specialties */}
      {displaySpecialties.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">Specialties</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {displaySpecialties.map((specialty, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Services Dropdown */}
      {services.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">Select a Service</h3>
          <div className="mt-2">
            <select
              value={selectedService?._id || ''}
              onChange={(e) => {
                const service = services.find(s => s._id === e.target.value);
                onServiceSelect(service);
              }}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Select a service...</option>
              {services.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.title} - {service.sessionDuration} minutes - ${service.pricePerSession}
                </option>
              ))}
            </select>
            {selectedService && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{selectedService.title}</h4>
                <p className="mt-1 text-sm text-gray-600">
                  {selectedService.sessionDuration} minutes • ${selectedService.pricePerSession}
                </p>
                {selectedService.description && (
                  <p className="mt-2 text-sm text-gray-500">{selectedService.description}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultantInfo;
