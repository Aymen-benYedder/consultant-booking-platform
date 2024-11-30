/**
 * Main Layout Component
 * Provides the base layout structure for all pages including header and content area.
 * 
 * @module components/Layout
 * @requires react-router-dom - For outlet component
 * @requires components/Header - Main navigation header
 * 
 * Related Files:
 * - src/components/Header.jsx - Main navigation header
 * - src/App.js - Used in router configuration
 * - src/components/auth/* - Authentication components
 * 
 * Features:
 * - Consistent layout across all pages
 * - Header with navigation
 * - Dynamic content rendering via Outlet
 * 
 * Usage:
 * Wrap your app with Layout component to provide consistent structure
 * The Outlet component will render the child routes
 */

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

/**
 * Layout Component
 * Wraps all page content with consistent header and structure
 * 
 * @component
 * @returns {React.ReactElement} The layout component with header and content
 */

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white shadow-inner py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          {new Date().getFullYear()} Consultant Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
