import { SWRConfig } from 'swr';

export const swrConfig = {
  // Enable automatic revalidation on window focus
  revalidateOnFocus: true,

  // Enable automatic revalidation on network recovery
  revalidateOnReconnect: true,

  // Deduplicate requests with the same key in a 2-second window
  dedupingInterval: 2000,

  // Keep data in cache for 5 minutes
  // This means even after unmounting, the data will be available immediately when remounting
  provider: () => new Map(),

  // Retry failed requests 3 times with exponential backoff
  errorRetryCount: 3,
  errorRetryInterval: 1000, // Start with 1 second delay
  shouldRetryOnError: (error) => {
    // Don't retry on 4xx errors as they are client errors
    return error.status < 400 || error.status >= 500;
  },

  // Configure how errors are thrown
  onError: (error, key) => {
    if (error.status === 403 || error.status === 404) {
      // Handle specific error cases
      console.warn(`API error on ${key}:`, error);
    } else {
      console.error(`API error on ${key}:`, error);
    }
  },

  // Configure loading timeout
  loadingTimeout: 5000,
};
