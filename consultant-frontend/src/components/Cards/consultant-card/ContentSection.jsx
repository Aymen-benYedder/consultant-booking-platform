import React from 'react';
import PropTypes from 'prop-types';
import { StarIcon } from '@heroicons/react/24/solid';

const ContentSection = ({ consultant, onBookClick }) => {
  // Extract and validate data with fallbacks
  const specialties = Array.isArray(consultant?.expertise) 
    ? consultant.expertise 
    : consultant?.specialty 
      ? [consultant.specialty]
      : [];

  const rating = parseFloat(consultant?.rating) || 4.5;
  const totalReviews = parseInt(consultant?.totalReviews) || 0;
  const name = consultant?.name || 'Consultant';
  const description = consultant?.description || 'Professional consultant with expertise in various fields.';
  const email = consultant?.email || '';

  return (
    <div className="px-4 py-3 w-72">
      {/* Specialties Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3 max-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
        {specialties.slice(0, 3).map((specialty, index) => (
          <span
            key={specialty + index}
            className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
          >
            {specialty}
          </span>
        ))}
      </div>

      {/* Consultant Info */}
      <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
        {name}
      </h3>
      
      {/* Rating Section */}
      <div className="flex items-center gap-1 mb-1">
        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <StarIcon
              key={index}
              className={`h-4 w-4 ${
                index < Math.floor(rating)
                  ? 'text-yellow-400'
                  : index < rating
                  ? 'text-yellow-400 opacity-50'
                  : 'text-gray-300'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)} {totalReviews > 0 && `(${totalReviews})`}
        </span>
      </div>

      <p className="text-gray-500 text-sm mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors">
        {description}
      </p>

      <div className="flex items-center justify-between">
        {email && (
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800 transition-colors truncate max-w-[150px]">
              {email}
            </span>
          </div>
        )}
        <button
          onClick={onBookClick}
          className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Book
        </button>
      </div>
    </div>
  );
};

ContentSection.propTypes = {
  consultant: PropTypes.shape({
    name: PropTypes.string,
    expertise: PropTypes.arrayOf(PropTypes.string),
    specialty: PropTypes.string,
    rating: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    totalReviews: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    description: PropTypes.string,
    email: PropTypes.string
  }),
  onBookClick: PropTypes.func.isRequired
};

export default ContentSection;
