import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../AppContext';
import { StarIcon, BriefcaseIcon, ClockIcon, CurrencyDollarIcon, CalendarDaysIcon, MapPinIcon, LanguageIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import ConsultantModal from '../components/Modals/consultant-modal/ConsultantModal';
import { api } from '../utils/api';

const ConsultantProfile = () => {
  const { consultantId } = useParams();
  const navigate = useNavigate();
  const { consultants } = useContext(AppContext);
  const [consultant, setConsultant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    const fetchConsultant = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First try to find consultant in context
        if (consultants) {
          const foundConsultant = consultants.find(c => c._id === consultantId);
          if (foundConsultant) {
            console.log('Consultant from context:', foundConsultant);
            setConsultant(foundConsultant);
            setIsLoading(false);
            return;
          }
        }

        // If not found in context or context is empty, fetch from API
        try {
          const data = await api.getConsultant(consultantId);
          console.log('Consultant from API:', data);
          setConsultant(data);
        } catch (err) {
          if (err.message === 'Unauthorized access') {
            navigate('/login');
            return;
          }
          throw err;
        }
      } catch (err) {
        console.error('Error fetching consultant:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsultant();
  }, [consultantId, consultants, navigate]);

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  // Show error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Consultant</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show not found message if no consultant
  if (!consultant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultant Not Found</h2>
          <p className="text-gray-600">The consultant you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Define default services if none exist
  const defaultServices = [
    {
      _id: 'default-service',
      title: 'Initial Consultation',
      description: 'One-on-one consultation to discuss your needs and goals',
      price: '100',
      sessionDuration: '60'
    }
  ];

  console.log('ConsultantProfile - consultant:', consultant);
  console.log('ConsultantProfile - consultant.services:', consultant?.services);

  const services = consultant.services?.length > 0 ? consultant.services.map(service => ({
    ...service,
    _id: service._id || `service-${service.title.toLowerCase().replace(/\s+/g, '-')}`,
    price: service.pricePerSession || service.price
  })) : defaultServices;

  console.log('ConsultantProfile - transformed services:', services);

  const quickStats = [
    { 
      value: consultant.rating || '4.8', 
      label: 'Rating', 
      icon: <StarIcon className="h-6 w-6 text-yellow-400" />,
      reviews: consultant.reviewCount || '124'
    },
    { 
      value: consultant.experience || '8', 
      label: 'Years Experience', 
      icon: <BriefcaseIcon className="h-6 w-6 text-sky-600" /> 
    },
    { 
      value: consultant.responseTime || '24h', 
      label: 'Response Time', 
      icon: <ClockIcon className="h-6 w-6 text-sky-600" /> 
    },
    { 
      value: `$${consultant.hourlyRate || '50'}`, 
      label: 'Per Hour', 
      icon: <CurrencyDollarIcon className="h-6 w-6 text-sky-600" /> 
    }
  ];

  // Define default expertise if none exist
  const defaultExpertise = [
    'Strategic Planning',
    'Business Development',
    'Market Analysis',
    'Risk Management',
    'Project Management',
    'Financial Planning'
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Cover */}
      <div className="relative h-80 bg-gradient-to-r from-sky-600 to-indigo-600">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative pb-16">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:space-x-5">
              <div className="flex-shrink-0">
                <img
                  src={consultant.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant.name || 'Consultant')}&size=128&background=0369a1&color=ffffff`}
                  alt={consultant.name || 'Consultant'}
                  className="mx-auto h-32 w-32 rounded-xl object-cover shadow-lg"
                />
              </div>
              <div className="mt-4 text-center sm:text-left sm:mt-0 sm:pt-1">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{consultant.name}</h1>
                <p className="text-xl text-gray-600 font-medium">{consultant.title}</p>
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  {(consultant.expertise || defaultExpertise).slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-sky-100 px-3 py-0.5 text-sm font-medium text-sky-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                Book Consultation
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-gray-50 px-4 py-5 rounded-lg">
                <div className="flex items-center">
                  {stat.icon}
                  <span className="ml-2 text-lg font-medium text-gray-900">{stat.value}</span>
                  {stat.reviews && (
                    <span className="ml-2 text-sm text-gray-500 hidden sm:inline">
                      ({stat.reviews} reviews)
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {consultant.about || `${consultant.name || 'This consultant'} is a highly experienced professional with expertise in various aspects of their field. They have helped numerous clients achieve their goals through personalized consultation and expert guidance.`}
              </p>
            </section>

            {/* Expertise Section */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Areas of Expertise</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(consultant.expertise || defaultExpertise).map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-shrink-0 h-2 w-2 bg-sky-600 rounded-full" />
                    <span className="text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Services Section */}
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Services Offered</h2>
              <div className="grid gap-6">
                {services.map((service, index) => (
                  <div key={service._id || index} className="border rounded-lg p-4 hover:border-sky-500 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <p className="mt-1 text-gray-600">{service.description}</p>
                      </div>
                      <div className="w-full sm:w-auto text-left sm:text-right">
                        <p className="text-lg font-medium text-gray-900">${service.price}</p>
                        <p className="text-sm text-gray-500">{service.sessionDuration} minutes</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Availability Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CalendarDaysIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Available Mon-Fri</span>
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">{consultant.location || 'Remote'}</span>
                </div>
                <div className="flex items-center">
                  <LanguageIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">
                    {(consultant.languages || ['English']).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Credentials Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credentials</h3>
              <div className="space-y-4">
                {(consultant.credentials || [
                  { title: 'MBA', institution: 'Harvard Business School', year: '2015' },
                  { title: 'Certified Management Consultant', institution: 'IMC', year: '2016' }
                ]).map((credential, index) => (
                  <div key={index} className="flex items-start">
                    <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">{credential.title}</p>
                      <p className="text-sm text-gray-600">{credential.institution}</p>
                      <p className="text-sm text-gray-500">{credential.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <ConsultantModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        consultantId={consultantId}
      />
    </div>
  );
};

export default ConsultantProfile;
