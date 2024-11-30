/**
 * Global Application Context
 * Manages global state, authentication, and data fetching for the application.
 * 
 * @module AppContext
 * @requires react - Core React functionality
 * @requires jwt-decode - JWT token decoding
 * @requires services/api - API service modules
 * @requires services/cache - Caching service
 * 
 * Related Files:
 * - src/services/api.js - API service definitions
 * - src/services/cache.js - Caching service
 * - src/components/Auth/* - Authentication components
 * - src/pages/* - Pages using context data
 * 
 * Features:
 * - User authentication state management
 * - JWT token validation and refresh
 * - Global data management (consultants, services)
 * - Error handling and loading states
 * - Event-based auth state synchronization
 * - Efficient caching with SWR
 */

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from './services/api';
import { useCachedData, CACHE_CONFIG, cacheUtils } from './services/cache';

/**
 * Application Context
 * Provides global state and functions to the application
 * @type {React.Context}
 */
export const AppContext = createContext();

// Global initialization promise to handle StrictMode double-mounting
let globalInitPromise = null;

/**
 * Application Context Provider Component
 * Manages global state and provides context values to children
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * 
 * State Management:
 * - User authentication state
 * - Consultants and services data
 * - Loading and error states
 * - Token validation and refresh
 * 
 * Features:
 * - Automatic token validation
 * - Periodic data refresh
 * - Error handling
 * - Event-based state updates
 * - Efficient caching with SWR
 */
export const AppProvider = ({ children }) => {
  // State declarations
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use SWR for consultants and services data with proper cache types
  const { 
    data: consultants = [], 
    isLoading: isConsultantsLoading,
    error: consultantsError,
    mutate: mutateConsultants 
  } = useCachedData('/consultants', {
    type: 'CONSULTANTS',
    onError: (error) => {
      console.error('Error fetching consultants:', error);
      setError(error.message);
    }
  });

  const { 
    data: services = [], 
    isLoading: isServicesLoading,
    error: servicesError,
    mutate: mutateServices 
  } = useCachedData('/services', {
    type: 'SERVICES',
    onError: (error) => {
      console.error('Error fetching services:', error);
      setError(error.message);
    }
  });

  const isLoading = isConsultantsLoading || isServicesLoading;
  const contextError = error || consultantsError || servicesError;

  // Refs for controlling initialization and requests
  const isInitialized = useRef(false);
  const authCheckTimeout = useRef(null);
  const authPromise = useRef(null);

  /**
   * Validates JWT token
   * Checks if token exists and is not expired
   * 
   * @function
   * @returns {boolean} Token validity status
   */
  const validateToken = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return false;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        localStorage.removeItem('token');
        setUser(null);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      localStorage.removeItem('token');
      setUser(null);
      return false;
    }
  }, []);

  /**
   * Refreshes application data
   * Uses SWR's mutate function to trigger revalidation
   * 
   * @function
   * @param {boolean} force - Force refresh regardless of cache state
   * @returns {Promise<void>}
   */
  const refreshData = useCallback(async () => {
    try {
      setError(null);
      await Promise.all([
        mutateConsultants(),
        mutateServices()
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data. Please try again later.');
    }
  }, [mutateConsultants, mutateServices]);

  /**
   * Checks authentication and loads user data
   * Validates token and fetches current user information
   * 
   * @function
   * @returns {Promise<void>}
   */
  const checkAuthAndLoadUser = useCallback(async () => {
    // Return existing promise if auth check is in progress
    if (authPromise.current) {
      return authPromise.current;
    }

    authPromise.current = (async () => {
      if (!validateToken()) {
        setUser(null);
        setIsAuthLoading(false);
        authPromise.current = null;
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        localStorage.removeItem('token');
      } finally {
        setIsAuthLoading(false);
        authPromise.current = null;
      }
    })();

    return authPromise.current;
  }, [validateToken]);

  // Initialize application data only once
  useEffect(() => {
    const initializeApp = async () => {
      // Use global promise to handle StrictMode double-mounting
      if (!globalInitPromise) {
        globalInitPromise = (async () => {
          try {
            await Promise.all([
              refreshData(),
              checkAuthAndLoadUser()
            ]);
          } catch (error) {
            console.error('Error initializing app:', error);
          }
        })();
      }
      
      if (!isInitialized.current) {
        isInitialized.current = true;
        await globalInitPromise;
      }
    };

    initializeApp();
    
    // Cleanup function
    return () => {
      // Only clean up global promise if this instance initialized it
      if (isInitialized.current) {
        globalInitPromise = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up periodic token validation
  useEffect(() => {
    const checkAuth = async () => {
      if (!validateToken()) {
        setUser(null);
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    };

    authCheckTimeout.current = setInterval(checkAuth, 60000);

    return () => {
      if (authCheckTimeout.current) {
        clearInterval(authCheckTimeout.current);
      }
    };
  }, [validateToken]);

  // Handle auth-related events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      cacheUtils.clearAll(); // Clear all cache on logout
    };

    const handleUnauthorized = () => {
      setUser(null);
      cacheUtils.clearAll();
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  /**
   * User login handler
   * Authenticates user and loads user data
   * 
   * @function
   * @param {string} credential - Google OAuth credential
   * @returns {Promise<Object>} Login response
   */
  const login = useCallback(async (credential) => {
    try {
      const response = await authAPI.login(credential);
      await checkAuthAndLoadUser();
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [checkAuthAndLoadUser]);

  /**
   * User logout handler
   * Clears user session and local storage
   * 
   * @function
   */
  const logout = useCallback(() => {
    authAPI.logout();
  }, []);

  // Context value object
  const contextValue = {
    user,
    setUser,
    consultants,
    services,
    isLoading,
    error: contextError,
    refreshData,
    validateToken,
    mutateConsultants,
    mutateServices,
    login,
    logout
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};