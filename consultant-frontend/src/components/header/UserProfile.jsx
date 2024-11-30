import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

const UserProfile = ({ user, isOpen, onToggle, onLogout, scrolled }) => {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center space-x-2 ${
          scrolled ? 'text-gray-700 hover:text-primary' : 'text-white hover:text-sky-100'
        }`}
      >
        <img
          src={user.picture}
          alt={user.name}
          className="h-8 w-8 rounded-full"
        />
        <span className="text-sm font-medium">{user.name}</span>
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5">
          <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
          >
            Profile
          </Link>
          <button
            onClick={onLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
