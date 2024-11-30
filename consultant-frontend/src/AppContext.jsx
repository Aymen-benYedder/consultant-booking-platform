import React, { createContext, useState, useEffect } from 'react';
import api from './utils/api';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [consultants, setConsultants] = useState(null);
  const [services, setServices] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Load consultants and services on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch data using API utility
        const [consultantsData, servicesData] = await Promise.all([
          api.getConsultants(),
          api.getServices()
        ]);

        setConsultants(consultantsData);
        setServices(servicesData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle Google login
  const login = async (credential) => {
    try {
      setIsAuthenticating(true);
      setError(null);

      if (!credential || typeof credential !== 'string') {
        console.error('Invalid credential format:', credential);
        throw new Error('Invalid Google credential');
      }

      // Clear any existing token before login attempt
      localStorage.removeItem('token');

      const data = await api.login({
        credential: credential
      });

      if (!data?.token) {
        throw new Error('Invalid response: missing token');
      }

      if (!data?.user) {
        throw new Error('Invalid response: missing user data');
      }

      // Set user only after successful token storage
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Login failed:', err);
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticating(false);
        return;
      }

      try {
        setIsAuthenticating(true);
        const data = await api.getCurrentUser();
        if (data?.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkAuth();
  }, []);

  const value = {
    user,
    setUser,
    consultants,
    setConsultants,
    services,
    setServices,
    isLoading,
    error,
    isAuthenticating,
    login,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
