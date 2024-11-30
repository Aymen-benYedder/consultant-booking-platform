import useSWR, { mutate } from 'swr';
import { api } from '../utils/api';

// Base fetcher that works with our existing API utility
const baseFetcher = async (url) => {
  try {
    // console.log('SWR Fetcher - Fetching:', url);
    const data = await api.makeRequest(url);
    // console.log('SWR Fetcher - Received data:', data);
    return data;
  } catch (error) {
    console.error('SWR Fetcher - Error:', error);
    throw error;
  }
};

// Generic hook for GET requests
export function useApi(endpoint, options = {}) {
  const {
    initialData,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    refreshInterval = 0,
    ...restOptions
  } = options;

  const { data, error, isLoading, mutate } = useSWR(
    endpoint,
    baseFetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus,
      revalidateOnReconnect,
      refreshInterval,
      ...restOptions,
      onSuccess: (data) => {
        console.log(`useApi - Success for ${endpoint}:`, data);
        options.onSuccess?.(data);
      },
      onError: (error) => {
        console.error(`useApi - Error for ${endpoint}:`, error);
        options.onError?.(error);
      }
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}

// Hook for handling mutations (POST, PUT, DELETE)
export function useApiMutation(endpoint, method = 'POST') {
  const execute = async (data, options = {}) => {
    try {
      console.log(`Executing mutation on ${endpoint}:`, { data, options });
      const result = await api.makeRequest(endpoint, {
        method,
        body: JSON.stringify(data),
        ...options,
      });

      // Invalidate related endpoints if specified
      if (options.invalidateEndpoints) {
        await Promise.all(
          options.invalidateEndpoints.map(endpoint => mutate(endpoint))
        );
      }

      return result;
    } catch (error) {
      console.error(`Mutation error on ${endpoint}:`, error);
      throw error;
    }
  };

  return { execute };
}

// Hook for file uploads
export function useFileUpload(endpoint) {
  const upload = async (bookingId, formData, options = {}) => {
    if (!bookingId) {
      console.error('No booking ID provided for file upload');
      throw new Error('Booking ID is required for file upload');
    }

    try {
      const fullEndpoint = endpoint.replace(':bookingId', bookingId);
      console.log(`Uploading file to ${fullEndpoint}`, { bookingId });
      
      const result = await api.makeRequest(fullEndpoint, {
        method: 'POST',
        body: formData,
        headers: {}, // Let browser set content-type for FormData
        ...options,
      });

      console.log('File upload successful:', result);

      // Invalidate related endpoints if specified
      if (options.invalidateEndpoints) {
        await Promise.all(
          options.invalidateEndpoints.map(endpoint => mutate(endpoint))
        );
      }

      return result;
    } catch (error) {
      console.error(`File upload error on ${endpoint}:`, error);
      throw error;
    }
  };

  return { upload };
}

// Specialized hook for document uploads
export function useUploadDocuments() {
  // Use the correct documents endpoint
  const { upload } = useFileUpload('/bookings/:bookingId/documents');
  return { upload };
}

// Specialized hooks for each API endpoint
export function useConsultants() {
  return useApi('/consultants');
}

export function useConsultant(id) {
  const { data, error, isLoading } = useApi(
    id ? `/consultants/${id}` : null,
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        console.log('Consultant data fetched:', data);
      },
      onError: (error) => {
        console.error('Error fetching consultant:', error);
      }
    }
  );

  return {
    data,
    error,
    isLoading
  };
}

export function useServices() {
  return useApi('/services');
}

export function useService(id) {
  return useApi(id ? `/services/${id}` : null);
}

export function useMyAppointments() {
  return useApi('/bookings/client');
}

export function useCurrentUser() {
  return useApi('/auth/me', {
    revalidateOnFocus: false, // Only revalidate on explicit mutate calls
  });
}

// Mutation hooks
export function useCreateBooking() {
  return useApiMutation('/bookings/book', 'POST');
}

export function useUpdateProfile() {
  return useApiMutation('/profile', 'PUT');
}

export function useUploadAvatar() {
  return useFileUpload('/profile/avatar');
}

// Authentication mutation (special case)
export function useLogin() {
  const execute = async (credentials) => {
    try {
      console.log('Executing login with credentials');
      const response = await api.login(credentials);
      // After successful login, invalidate current user data
      await mutate('/auth/me');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  return { execute };
}
