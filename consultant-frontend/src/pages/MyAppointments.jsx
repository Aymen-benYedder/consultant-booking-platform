import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  UserIcon, 
  CurrencyDollarIcon, 
  DocumentIcon,
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as PendingIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchAppointments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.getMyAppointments();
        const appointmentsData = Array.isArray(response) ? response : 
                               response.bookings ? response.bookings :
                               response.data ? response.data : [];
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        if (err.status === 401) {
          navigate('/login');
          setError('Please log in to view your appointments');
        } else if (err.status === 404) {
          setError('No appointments found');
        } else {
          setError(err.message || 'Failed to load appointments. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, navigate]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    
    try {
      await api.cancelBooking(bookingId);
      setAppointments(appointments.map(app => 
        app._id === bookingId ? { ...app, status: 'cancelled' } : app
      ));
    } catch (err) {
      console.error('Error cancelling booking:', err);
      alert('Failed to cancel booking. Please try again.');
    }
  };

  const handleReschedule = (bookingId) => {
    navigate(`/reschedule/${bookingId}`);
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <PendingIcon className="h-5 w-5 text-yellow-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-sky-500" />;
      default:
        return <PendingIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      case 'cancelled':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'completed':
        return 'bg-sky-50 text-sky-700 ring-sky-600/20';
      default:
        return 'bg-gray-50 text-gray-700 ring-gray-600/20';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const now = new Date();
    const matchesFilter = filter === 'all' ? true :
                         filter === 'upcoming' ? appointmentDate >= now :
                         filter === 'past' ? appointmentDate < now :
                         filter === appointment.status.toLowerCase();
    
    const searchString = `${appointment.consultant?.name} ${appointment.service?.title}`.toLowerCase();
    const matchesSearch = searchTerm ? searchString.includes(searchTerm.toLowerCase()) : true;
    
    return matchesFilter && matchesSearch;
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Appointments</h2>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="mt-2 text-gray-600">Manage and track your consultation sessions</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search by consultant or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {['all', 'upcoming', 'pending', 'confirmed', 'completed', 'cancelled'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 
                  ${filter === filterOption 
                    ? 'bg-sky-600 text-white shadow-sm' 
                    : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <CalendarDaysIcon className="h-full w-full" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">No Appointments Found</h2>
            <p className="mt-2 text-gray-500">
              {searchTerm 
                ? "No appointments match your search criteria." 
                : filter !== 'all' 
                  ? `You don't have any ${filter} appointments.` 
                  : "You have not booked any appointments yet."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment._id} 
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center">
                    <img
                      src={appointment.consultant?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(appointment.consultant?.name || 'Consultant')}&size=128&background=0369a1&color=ffffff`}
                      alt={appointment.consultant?.name}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-white"
                    />
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {appointment.consultant?.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{appointment.service?.title}</p>
                    </div>
                    <div className={`ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getStatusColor(appointment.status)}`}>
                      {getStatusIcon(appointment.status)}
                      <span className="ml-1">{appointment.status}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  <div className="flex items-center text-gray-700">
                    <CalendarDaysIcon className="h-5 w-5 text-sky-600" />
                    <span className="ml-2">
                      {format(new Date(appointment.date), 'MMMM d, yyyy')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <ClockIcon className="h-5 w-5 text-sky-600" />
                    <span className="ml-2">{appointment.time}</span>
                    <span className="ml-2 text-gray-400">({appointment.duration} min)</span>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <CurrencyDollarIcon className="h-5 w-5 text-sky-600" />
                    <span className="ml-2">Payment: {appointment.paymentStatus}</span>
                  </div>

                  {appointment.documents?.length > 0 && (
                    <div className="flex items-center text-gray-700">
                      <DocumentIcon className="h-5 w-5 text-sky-600" />
                      <span className="ml-2">{appointment.documents.length} Document(s)</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                {appointment.status === 'pending' && (
                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => handleCancelBooking(appointment._id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReschedule(appointment._id)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors duration-200"
                    >
                      <ArrowPathIcon className="h-4 w-4 mr-1" />
                      Reschedule
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;
