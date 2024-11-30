/**
 * Cache Service
 * Implements a comprehensive caching strategy with:
 * - Frontend SWR caching with configurable durations
 * - Request deduplication
 * - Automatic background updates
 * - Error handling and retry logic
 */

import { SWRConfig } from 'swr';
import useSWR from 'swr';
import axios from 'axios';

// Cache configuration constants
export const CACHE_CONFIG = {
  CONSULTANTS: {
    duration: 5 * 60 * 1000,      // 5 minutes
    staleTime: 2 * 60 * 1000,     // Consider data stale after 2 minutes
    retryCount: 3,                // Number of retry attempts
    dedupingInterval: 5000,       // 5 seconds deduping window
  },
  SERVICES: {
    duration: 10 * 60 * 1000,     // 10 minutes
    staleTime: 5 * 60 * 1000,     // Consider data stale after 5 minutes
    retryCount: 3,
    dedupingInterval: 5000,
  },
  USER_DATA: {
    duration: 2 * 60 * 1000,      // 2 minutes
    staleTime: 1 * 60 * 1000,     // Consider data stale after 1 minute
    retryCount: 3,
    dedupingInterval: 2000,
  }
};

// Request deduplication map
const pendingRequests = new Map();

// In-memory cache for static data
const staticCache = new Map();

// Axios instance with default config
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to handle authentication
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling and caching
axiosInstance.interceptors.response.use(
  (response) => {
    // Cache static data if header is present
    const cacheControl = response.headers['cache-control'];
    if (cacheControl?.includes('immutable')) {
      staticCache.set(response.config.url, response.data);
    }
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Global fetcher function for SWR with request deduplication
export const fetcher = async (url) => {
  // Check static cache first
  if (staticCache.has(url)) {
    return staticCache.get(url);
  }

  // Check if there's already a pending request for this URL
  if (pendingRequests.has(url)) {
    return pendingRequests.get(url);
  }

  // Create new request promise
  const promise = axiosInstance.get(url)
    .finally(() => {
      pendingRequests.delete(url);
    });

  // Store the promise in the pending requests map
  pendingRequests.set(url, promise);

  return promise;
};

// Custom cache keys generator
export const generateCacheKey = (endpoint, params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

// SWR configuration provider component
export const CacheProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        shouldRetryOnError: true,
        errorRetryCount: 3,
        dedupingInterval: 5000,
        onError: (error) => {
          console.error('SWR Error:', error);
          // Log cache miss/hit ratio and errors for monitoring
          logCacheMetrics(error);
        }
      }}
    >
      {children}
    </SWRConfig>
  );
};

// Custom hooks for data fetching with specific cache configurations
export const useCachedData = (endpoint, options = {}) => {
  const {
    params = {},
    type = 'CONSULTANTS', // Default cache type
    ...swrOptions
  } = options;

  const cacheKey = generateCacheKey(endpoint, params);
  const cacheConfig = CACHE_CONFIG[type] || CACHE_CONFIG.CONSULTANTS;

  return useSWR(cacheKey, fetcher, {
    ...swrOptions,
    refreshInterval: cacheConfig.duration,
    dedupingInterval: cacheConfig.dedupingInterval,
    errorRetryCount: cacheConfig.retryCount,
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateIfStale: true,
    onSuccess: (data) => {
      options.onSuccess?.(data);
      logCacheMetrics({ hit: true, endpoint });
    },
    onError: (error) => {
      options.onError?.(error);
      logCacheMetrics({ hit: false, endpoint, error });
    }
  });
};

// Cache metrics logging
const logCacheMetrics = (data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Cache Metrics:', {
      timestamp: new Date().toISOString(),
      ...data
    });
  }
};

// Cache utilities
export const cacheUtils = {
  clearAll: () => {
    localStorage.clear();
    sessionStorage.clear();
    pendingRequests.clear();
    staticCache.clear();
    window.dispatchEvent(new CustomEvent('swr:clear-all'));
  },

  clearEntry: (endpoint, params = {}) => {
    const cacheKey = generateCacheKey(endpoint, params);
    staticCache.delete(cacheKey);
    window.dispatchEvent(new CustomEvent('swr:clear-entry', { detail: { key: cacheKey } }));
  },

  revalidate: (endpoint, params = {}) => {
    const cacheKey = generateCacheKey(endpoint, params);
    window.dispatchEvent(new CustomEvent('swr:revalidate', { detail: { key: cacheKey } }));
  },

  // Get cache statistics
  getStats: () => {
    return {
      pendingRequests: pendingRequests.size,
      staticCacheSize: staticCache.size,
      localStorage: Object.keys(localStorage).length,
      sessionStorage: Object.keys(sessionStorage).length
    };
  }
};
