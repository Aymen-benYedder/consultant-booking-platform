/**
 * Home Page Component
 * Displays consultants and services with efficient caching and data management
 */

import React, { useContext, useState, useEffect, lazy, Suspense } from 'react';
import { AppContext } from '../AppContext';

// Lazy load components
const SearchBar = lazy(() => import('../components/SearchBar'));
const ConsultantCard = lazy(() => import('../components/Cards/consultant-card/ConsultantCard'));
const ServiceCard = lazy(() => import('../components/Cards/service-card/ServiceCard'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="animate-pulse bg-gray-200 rounded-lg h-80 w-72"></div>
);

function HomePage() {
  const { consultants, services, isLoading, error: contextError } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('consultants');
  const [filteredConsultants, setFilteredConsultants] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);

  // Preload first consultant's image for LCP optimization
  useEffect(() => {
    if (consultants?.[0]?.avatar) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.href = consultants[0].avatar;
      document.head.appendChild(preloadLink);
    }
  }, [consultants]);

  useEffect(() => {
    if (activeTab === 'consultants') {
      setFilteredConsultants(consultants || []);
    } else {
      setFilteredServices(services || []);
    }
  }, [consultants, services, activeTab]);

  const handleSearch = (searchTerm) => {
    const term = searchTerm.toLowerCase();
    
    if (activeTab === 'consultants') {
      const filtered = (consultants || []).filter(consultant => 
        consultant.name?.toLowerCase().includes(term) ||
        consultant.specialty?.toLowerCase().includes(term) ||
        consultant.description?.toLowerCase().includes(term)
      );
      setFilteredConsultants(filtered);
    } else {
      const filtered = (services || []).filter(service =>
        service.title?.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term) ||
        service.specialty?.toLowerCase().includes(term)
      );
      setFilteredServices(filtered);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (contextError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)]">
          <p className="text-red-500 mb-4">{contextError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<LoadingFallback />}>
        <SearchBar onSearch={handleSearch} activeTab={activeTab} setActiveTab={setActiveTab} />
      </Suspense>
      
      <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 place-items-center">
          {activeTab === 'consultants' ? (
            filteredConsultants.length > 0 ? (
              filteredConsultants.map((consultant, index) => (
                <Suspense key={consultant._id} fallback={<LoadingFallback />}>
                  <ConsultantCard 
                    consultant={consultant} 
                    index={index}
                    priority={index < 8}
                  />
                </Suspense>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No consultants found
              </div>
            )
          ) : (
            filteredServices.length > 0 ? (
              filteredServices.map(service => (
                <Suspense key={service._id} fallback={<LoadingFallback />}>
                  <ServiceCard service={service} />
                </Suspense>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No services found
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;