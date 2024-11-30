import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { AppContext } from '../AppContext';
import LogoBrand from './header/LogoBrand';
import UserProfile from './header/UserProfile';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Header = () => {
  const { user, login, logout } = useContext(AppContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [window.location.pathname]);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const credential = credentialResponse.credential;
      await login(credential);
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-primary'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <LogoBrand scrolled={scrolled} />

          <div className="hidden lg:flex items-center gap-6">
            <Link 
              to="/" 
              className={`px-3 py-2 text-sm font-medium ${
                scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-sky-100'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className={`px-3 py-2 text-sm font-medium ${
                scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-sky-100'
              }`}
            >
              About Us
            </Link>
            {user && (
              <Link 
                to="/my-appointments" 
                className={`px-3 py-2 text-sm font-medium ${
                  scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-sky-100'
                }`}
              >
                My Appointments
              </Link>
            )}
            {user ? (
              <>
                <button 
                  className={`relative p-2 ${
                    scrolled ? 'text-gray-600 hover:text-primary' : 'text-white hover:text-sky-100'
                  }`}
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                </button>
                <UserProfile 
                  user={user} 
                  isOpen={dropdownOpen}
                  onToggle={toggleDropdown}
                  onLogout={handleLogout}
                  scrolled={scrolled}
                />
              </>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => console.log('Login Failed')}
                useOneTap={false}
                theme="filled_blue"
                shape="pill"
                size="large"
                text="continue_with"
              />
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2"
          >
            <Bars3Icon className="h-7 w-7 text-white" />
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="py-2">
              <Link
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About Us
              </Link>
              {user && (
                <Link
                  to="/my-appointments"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Appointments
                </Link>
              )}
              {!user && (
                <div className="px-4 py-2">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => console.log('Login Failed')}
                    useOneTap={false}
                    theme="filled_blue"
                    shape="pill"
                    size="large"
                    text="continue_with"
                  />
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;