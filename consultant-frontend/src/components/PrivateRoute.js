/**
 * Protected Route Component
 * Higher-order component that handles route protection based on authentication state.
 * 
 * @module components/PrivateRoute
 * @requires react-router-dom - For navigation and routing
 * @requires contexts/AppContext - For authentication state
 * 
 * Related Files:
 * - src/AppContext.js - Authentication state management
 * - src/App.js - Router configuration
 * - src/components/auth/* - Authentication components
 * 
 * Features:
 * - Route protection based on authentication
 * - Role-based access control
 * - Redirect to login for unauthenticated users
 * - Loading state handling
 * 
 * Usage:
 * Wrap protected routes with this component
 * Optionally specify required roles for access control
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../AppContext';

/**
 * Private Route Component
 * Protects routes based on authentication state and user roles
 * 
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected route content
 * @param {Array<string>} [props.roles] - Required roles for access
 * @returns {React.ReactElement} Protected content or redirect
 */
const PrivateRoute = ({ children, roles = [] }) => {
  const { user, isAuthLoading } = useContext(AppContext);

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
