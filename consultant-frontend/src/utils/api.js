const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if response is ok (status in 200-299 range)
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:logout'));
        throw new Error('Unauthorized access');
      }

      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || 'An error occurred';
      } catch {
        errorMessage = errorText || `HTTP error! status: ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Try to parse as JSON first
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return { data, status: response.status };
    }

    // If not JSON, return text response
    const text = await response.text();
    return { data: { message: text }, status: response.status };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

const login = async (response) => {
  try {
    console.log('Processing login with response:', response);
    
    if (!response?.credential) {
      throw new Error('No credentials provided');
    }

    const result = await authenticatedFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: response.credential }),
    });

    if (!result?.data?.token) {
      throw new Error('No token received from server');
    }

    localStorage.setItem('token', result.data.token);
    return result.data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

const api = {
  // Request helper with authentication and better error handling
  makeRequest: async (endpoint, options = {}) => {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log(`Making request to: ${url}`);
      
      // Don't set Content-Type for FormData
      const headers = options.body instanceof FormData
        ? { ...options.headers }
        : {
            'Content-Type': 'application/json',
            ...options.headers,
          };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Request headers:', headers);
      
      // Don't stringify FormData
      const body = options.body instanceof FormData
        ? options.body
        : options.body ? JSON.stringify(options.body) : undefined;

      console.log('Request options:', {
        method: options.method || 'GET',
        headers,
        body: body instanceof FormData ? '[FormData]' : body
      });

      const response = await authenticatedFetch(endpoint, {
        ...options,
        headers,
        body
      });

      console.log(`Parsed API Response for ${endpoint}:`, response.data);
      
      // For booking endpoints, ensure we return the booking object
      if (endpoint.includes('/bookings')) {
        console.log('Processing booking response:', response.data);
        // Handle list of bookings
        if (Array.isArray(response.data)) {
          console.log('Found array of bookings:', response.data);
          return response.data;
        }
        // Handle single booking
        if (response.data.booking) {
          console.log('Found booking in response.booking:', response.data.booking);
          return response.data.booking;
        }
        if (response.data.data?.booking) {
          console.log('Found booking in response.data.booking:', response.data.data.booking);
          return response.data.data.booking;
        }
        if (response.data._id) {
          console.log('Found booking in root response:', response.data);
          return response.data;
        }
      }
      
      // For other endpoints, handle nested data
      return response.data.data || response.data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // Consultant endpoints
  async getConsultants() {
    return this.makeRequest('/consultants');
  },

  async getConsultant(id) {
    return this.makeRequest(`/consultants/${id}`);
  },

  // Service endpoints
  async getServices() {
    return this.makeRequest('/services');
  },

  async getService(id) {
    return this.makeRequest(`/services/${id}`);
  },

  // Profile management
  async updateProfile(profileData) {
    return this.makeRequest('/users/me', {
      method: 'PUT',
      body: profileData
    });
  },

  // Booking management
  async getMyAppointments() {
    return this.makeRequest('/bookings/client');
  },

  async createBooking(bookingData) {
    return this.makeRequest('/bookings', {
      method: 'POST',
      body: bookingData
    });
  }
};

export { api, API_BASE_URL, authenticatedFetch, login };
