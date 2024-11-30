import React, { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const OptimizedImage = ({ src, alt, className, index = 0 }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const isEagerLoaded = index < 6; // First 6 images are eager loaded

  return (
    <div className="relative">
      {/* Low-quality placeholder */}
      <div 
        className={`absolute inset-0 bg-gray-100 transition-opacity duration-300 ${
          imageLoaded ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <UserCircleIcon className="h-32 w-32 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
      </div>
      
      {/* Main image with conditional eager/lazy loading */}
      <img
        src={src}
        alt={alt}
        loading={isEagerLoaded ? 'eager' : 'lazy'}
        decoding={isEagerLoaded ? 'sync' : 'async'}
        fetchPriority={isEagerLoaded ? 'high' : 'low'}
        onLoad={() => setImageLoaded(true)}
        className={`${className} transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export default OptimizedImage;
