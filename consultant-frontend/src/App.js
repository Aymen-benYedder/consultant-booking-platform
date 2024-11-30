/**
 * Main Application Component
 * Root component that sets up routing, authentication, and global context.
 * 
 * @module App
 * @requires react-router-dom - For application routing
 * @requires @react-oauth/google - Google OAuth integration
 * @requires react - Core React functionality
 * 
 * Related Files:
 * - src/AppContext.js - Global application state management
 * - src/pages/* - All page components
 * - src/components/Layout.js - Main layout wrapper
 * - src/components/ErrorBoundary.js - Error handling component
 * 
 * Environment Variables:
 * - REACT_APP_GOOGLE_CLIENT_ID: Google OAuth client ID (required)
 */

import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Suspense } from 'react';
import { AppProvider } from './contexts/AppContext';
import HomePage from './pages/HomePage';
import AboutUs from './pages/AboutUs';
import ConsultantProfile from './pages/ConsultantProfile';
import MyAppointments from './pages/MyAppointments';
import Profile from './pages/Profile';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import { SWRConfig } from 'swr';
import { swrConfig } from './config/swr';

/**
 * Application Router Configuration
 * Defines the routing structure and component hierarchy
 * 
 * Route Structure:
 * - / (Layout)
 *   - / (HomePage)
 *   - /about (AboutUs)
 *   - /consultant/:consultantId (ConsultantProfile)
 *   - /my-appointments (MyAppointments)
 *   - /profile (Profile)
 * 
 * Features:
 * - Nested routing with shared layout
 * - Index routes for main pages
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/about',
        element: <AboutUs />,
      },
      {
        path: '/consultant/:consultantId',
        element: <ConsultantProfile />,
      },
      {
        path: '/my-appointments',
        element: <MyAppointments />,
      },
      {
        path: '/profile',
        element: <Profile />,
      },
    ],
  },
]);

/**
 * Root Application Component
 * Sets up the application with required providers and routing
 * 
 * Features:
 * - Google OAuth integration
 * - Global state management
 * - Suspense for code splitting
 * - Environment variable validation
 * 
 * @component
 * @returns {React.ReactElement|null} The rendered application or null if configuration is invalid
 * 
 * Related Components:
 * - AppProvider - Global state management
 * - Layout - Main application layout
 * - ErrorBoundary - Error handling
 */
function App() {
  // Validate required environment variables
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  if (!googleClientId) {
    console.error('Missing REACT_APP_GOOGLE_CLIENT_ID environment variable');
    return null;
  }

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppProvider>
          <SWRConfig value={swrConfig}>
            <Suspense fallback={<div>Loading...</div>}>
              <RouterProvider router={router} />
            </Suspense>
          </SWRConfig>
        </AppProvider>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
