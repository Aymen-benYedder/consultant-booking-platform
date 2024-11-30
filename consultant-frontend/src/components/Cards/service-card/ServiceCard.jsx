import React, { useState } from 'react';
import { ArrowRightIcon, ClockIcon, CurrencyDollarIcon, UserIcon } from '@heroicons/react/24/outline';
import ConsultantModal from '../../Modals/consultant-modal/ConsultantModal';

const ServiceCard = ({ service }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Extract consultant ID correctly
  const consultantId = service.consultantId?._id;
  
  // Ensure consistent service ID format
  const serviceId = service._id || service.id;
  const serviceName = service.title || service.name;

  // Debug log for service data
  console.log('ServiceCard - Raw service:', service);
  console.log('ServiceCard - Processed data:', {
    serviceId,
    consultantId,
    serviceName,
    rawId: service._id,
    rawTitle: service.title,
    rawName: service.name
  });

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{serviceName}</h3>
            <p className="text-sm text-gray-500">{service.category}</p>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        
        <div className="border-t pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center text-gray-600">
              <ClockIcon className="h-5 w-5 mr-2" />
              <span>{service.duration || service.sessionDuration} min</span>
            </div>
            <div className="flex items-center text-gray-600">
              <CurrencyDollarIcon className="h-5 w-5 mr-2" />
              <span>${service.price || service.pricePerSession}/session</span>
            </div>
          </div>
          <div className="flex items-center text-gray-600 mt-4">
            {service.consultantId?.userId?.avatar ? (
              <img 
                src={service.consultantId?.userId?.avatar} 
                alt={service.consultantId?.userId?.name}
                className="h-8 w-8 rounded-full mr-2 object-cover"
              />
            ) : (
              <UserIcon className="h-5 w-5 mr-2" />
            )}
            <div>
              <span className="font-medium">{service.consultantId?.userId?.name || 'Unknown Consultant'}</span>
              {service.consultantId?.userId?.specialty || service.category && (
                <span className="text-sm text-gray-500 block">{service.consultantId?.userId?.specialty || service.category}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consultantId={consultantId}
        serviceId={serviceId}
        serviceName={serviceName}
      />
    </>
  );
};

export default ServiceCard;
