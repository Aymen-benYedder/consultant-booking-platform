import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Suspense fallback={
          <div className="flex justify-center items-center h-[calc(100vh-64px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        }>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
