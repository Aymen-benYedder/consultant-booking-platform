import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback(async (credential) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authAPI.login(credential);
      const { token, user: userData } = response;
      
      // Store the token
      localStorage.setItem('token', token);
      
      // Decode and validate the token
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        throw new Error('Token has expired');
      }
      
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          throw new Error('Token has expired');
        }
      } catch (e) {
        console.warn('Invalid or expired token:', e);
        localStorage.removeItem('token');
        setUser(null);
        return;
      }

      const userData = await authAPI.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.warn('Auth check failed:', error);
      if (error.message.includes('Unauthorized')) {
        setUser(null);
        localStorage.removeItem('token');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize app on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    checkAuth,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
