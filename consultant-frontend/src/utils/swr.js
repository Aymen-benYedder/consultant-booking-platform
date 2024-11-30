import { SWRConfig } from 'swr';
import useSWR, { mutate } from 'swr';
import { api } from './api';

// Global fetcher function that works with our API utility
export const fetcher = async (url) => {
  try {
    const response = await api.makeRequest(url);
    return response;
  } catch (error) {
    throw error;
  }
};

// Custom mutation function that invalidates cache
export const apiMutate = async (url, data, options = {}) => {
  try {
    const response = await api.makeRequest(url, {
      method: options.method || 'POST',
      body: JSON.stringify(data),
      ...options,
    });
    
    // Invalidate the cache for this URL
    await mutate(url);
    
    // If this mutation affects other resources, invalidate them too
    if (options.relatedKeys) {
      await Promise.all(options.relatedKeys.map(key => mutate(key)));
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Global SWR Configuration
export const swrConfig = {
  fetcher,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  shouldRetryOnError: true,
  dedupingInterval: 2000,
  errorRetryCount: 3,
  onError: (error, key) => {
    console.error(`SWR Error for ${key}:`, error);
  }
};

export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
};

// Generic hook for any API endpoint
export const useAPI = (endpoint, options = {}) => {
  const { data, error, isLoading, mutate } = useSWR(
    endpoint ? endpoint : null,
    options.customFetcher || null,
    {
      ...options,
      revalidateOnMount: options.revalidateOnMount ?? true,
      revalidateOnFocus: options.revalidateOnFocus ?? true,
      revalidateOnReconnect: options.revalidateOnReconnect ?? true,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
    error,
  };
};

// Specialized hooks for specific endpoints
export const useConsultants = (options = {}) => {
  return useAPI('/consultants', options);
};

export const useConsultant = (id, options = {}) => {
  return useAPI(id ? `/consultants/${id}` : null, options);
};

export const useServices = (options = {}) => {
  return useAPI('/services', options);
};

export const useService = (id, options = {}) => {
  return useAPI(id ? `/services/${id}` : null, options);
};

export const useMyAppointments = (options = {}) => {
  return useAPI('/bookings/my-appointments', options);
};

export const useMyProfile = (options = {}) => {
  return useAPI('/profile', options);
};

// Hook for managing mutations (POST, PUT, DELETE)
export const useMutation = (endpoint) => {
  const update = async (data, options = {}) => {
    return apiMutate(endpoint, data, options);
  };

  return {
    update,
    // Expose the mutate function for manual cache updates
    mutateCache: (data, options) => mutate(endpoint, data, options),
  };
};

// Example usage of mutation with cache invalidation
export const useCreateBooking = () => {
  return useMutation('/bookings/book');
};

export const useUpdateProfile = () => {
  return useMutation('/profile');
};

// Utility function to prefetch data
export const prefetchData = async (endpoint, options = {}) => {
  return fetcher(endpoint, options);
};

export const uploadFile = async (url, formData) => {
  try {
    const response = await api.makeRequest(url, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set content-type for FormData
    });
    return response;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
