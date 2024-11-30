import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import useEntityStore from './entityStore';

const ApiContext = createContext(null);

export const useApi = () => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};

export const ApiProvider = ({ children }) => {
  const entityStore = useEntityStore();

  const getToken = useCallback(() => {
    return localStorage.getItem('token');
  }, []);

  const setToken = useCallback((token) => {
    if (token) {
      localStorage.setItem('token', token);
      const decoded = jwtDecode(token);
      const userId = entityStore.addUser(decoded.user);
      entityStore.setCurrentUserId(userId);
    } else {
      localStorage.removeItem('token');
      entityStore.clearStore();
    }
  }, [entityStore]);

  const authenticatedFetch = useCallback(async (url, options = {}) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': options.body instanceof FormData ? undefined : 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }, [getToken]);

  const login = useCallback(async (googleResponse) => {
    try {
      entityStore.setLoading('users', true);
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleResponse.credential }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      setToken(data.token);
      
      return data;
    } catch (error) {
      entityStore.setError('users', error.message);
      throw error;
    } finally {
      entityStore.setLoading('users', false);
    }
  }, [entityStore, setToken]);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  const value = useMemo(() => ({
    authenticatedFetch,
    login,
    logout,
    getToken,
  }), [authenticatedFetch, login, logout, getToken]);

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export default ApiContext;
