import React from 'react';
import PropTypes from 'prop-types';

const ImageSection = ({ 
  consultant, 
  isFavorite = false, 
  setIsFavorite, 
  index, 
  priority = false 
}) => {
  const defaultImage = `https://ui-avatars.com/api/?name=${encodeURIComponent(consultant?.name || 'Consultant')}&size=300&background=0369a1&color=ffffff`;
  
  // Try different possible image property names
  const profileImage = consultant?.profileImage || consultant?.avatar || consultant?.image || consultant?.photo;
  
  return (
    <div className="relative w-[300px] h-[300px] overflow-hidden">
      <img
        src={profileImage || defaultImage}
        alt={`${consultant?.name || 'Consultant'} - Profile`}
        className="w-[300px] h-[300px] object-cover transition-opacity duration-300 group-hover:opacity-90"
        loading={priority ? "eager" : "lazy"}
        decoding={priority ? "sync" : "async"}
        fetchpriority={priority ? "high" : "low"}
        width="300"
        height="300"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = defaultImage;
        }}
      />
      <div 
        className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors duration-200"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <svg
            className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
            fill={isFavorite ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

ImageSection.propTypes = {
  consultant: PropTypes.shape({
    name: PropTypes.string,
    profileImage: PropTypes.string,
    avatar: PropTypes.string,
    image: PropTypes.string,
    photo: PropTypes.string
  }),
  isFavorite: PropTypes.bool,
  setIsFavorite: PropTypes.func.isRequired,
  index: PropTypes.number,
  priority: PropTypes.bool
};

export default ImageSection;
