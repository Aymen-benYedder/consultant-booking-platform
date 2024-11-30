const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const validateToken = (token) => {
  if (!token) return false;
  try {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    return false;
  }
};

// Request helper with authentication
const makeRequest = async (endpoint, options = {}, requiresAuth = true) => {
  const token = localStorage.getItem('token');
  
  // Only validate token for protected routes
  if (requiresAuth && token && !validateToken(token)) {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    throw new Error('Token expired');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && requiresAuth && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle unauthorized responses for protected routes
    if (requiresAuth && response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      throw new Error('Unauthorized access');
    }

    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: async (credential) => {
    try {
      const response = await makeRequest('/auth/google/login', {
        method: 'POST',
        body: JSON.stringify({ credential }),
      }, false);

      if (response.token) {
        localStorage.setItem('token', response.token);
        return response;
      }
      throw new Error('No token received from server');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    window.dispatchEvent(new CustomEvent('auth:logout'));
  },

  getCurrentUser: async () => {
    try {
      const response = await makeRequest('/auth/me', {}, true);
      return response;
    } catch (error) {
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('Unauthorized access');
      }
      throw error;
    }
  },

  verifyToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await makeRequest('/auth/verify-token', {
        method: 'POST',
        body: JSON.stringify({ token }),
      }, false);
      
      return response.valid ? response.user : null;
    } catch (error) {
      console.error('Token verification failed:', error);
      localStorage.removeItem('token');
      return null;
    }
  },
};

// Consultants API
export const consultantsAPI = {
  getConsultant: async (id) => {
    const data = await makeRequest(`/consultants/${id}`, {}, false);
    return transformConsultant(data);
  },

  getConsultants: async () => {
    const data = await makeRequest('/consultants', {}, false);
    return (data || []).map(consultant => transformConsultant(consultant)).filter(Boolean);
  },
  
  getServices: async (id) => {
    const data = await makeRequest(`/services/consultant/${id}`, {}, false);
    return (data || []).map(service => transformService(service)).filter(Boolean);
  },
  
  updateServices: async (services) => {
    const data = await makeRequest('/consultants/services', {
      method: 'PUT',
      body: JSON.stringify({ services }),
    }, true);
    return data;
  },
};

// Services API
export const servicesAPI = {
  getServices: async () => {
    try {
      const response = await makeRequest('/services', {}, true);
      return (response || []).map(service => transformService(service)).filter(Boolean);
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  },
  
  getService: async (id) => {
    try {
      const response = await makeRequest(`/services/${id}`, {}, true);
      return transformService(response);
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return null;
    }
  },
};

// Bookings API
export const bookingsAPI = {
  createBooking: async (bookingData) => {
    try {
      return await makeRequest('/bookings/book', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
    } catch (error) {
      console.error('Failed to create booking:', error);
      throw error;
    }
  },

  getBookings: async () => {
    return await makeRequest('/bookings');
  },

  getBooking: (id) => makeRequest(`/bookings/${id}`),

  update: async (id, data) => {
    try {
      return await makeRequest(`/bookings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Failed to update booking ${id}:`, error);
      throw error;
    }
  },
};

// Users API
export const usersAPI = {
  update: async (id, userData) => {
    try {
      return await makeRequest(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    } catch (error) {
      console.error(`Failed to update user ${id}:`, error);
      throw error;
    }
  },

  getProfile: (id) => makeRequest(`/users/${id}/profile`)
};

// Data transformers
const transformConsultant = (consultant) => {
  if (!consultant) return null;
  return {
    ...consultant,
    id: consultant._id || consultant.id,
    name: consultant.name || 'Unknown Consultant',
    email: consultant.email || '',
    avatar: consultant.avatar || null,
    specialty: consultant.specialty || '',
    bio: consultant.bio || '',
  };
};

const transformService = (service) => {
  if (!service) return null;
  
  return {
    id: service._id,
    title: service.name || 'Unknown Service',
    description: service.description || '',
    specialty: service.category || '',
    pricePerSession: service.price || 0,
    sessionDuration: service.duration || 60,
    consultantId: service.consultantId || null,
    image: service.image || null
  };
};
