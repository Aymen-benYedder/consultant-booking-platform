import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="w-72 bg-white shadow-md rounded-xl animate-pulse" role="status" aria-label="Loading consultant card">
      {/* Image skeleton */}
      <div className="h-[300px] w-[300px] bg-gray-200 rounded-t-xl" />
      
      <div className="px-4 py-3 w-72">
        {/* Specialty tags skeleton */}
        <div className="flex flex-wrap gap-2 mb-3">
          {[...Array(3)].map((_, index) => (
            <div 
              key={index}
              className="h-6 w-16 bg-gray-200 rounded-full"
              style={{ width: `${Math.floor(Math.random() * 30 + 60)}px` }}
            />
          ))}
        </div>

        {/* Name skeleton */}
        <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="h-4 w-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-3/4 bg-gray-200 rounded" />
        </div>

        {/* Bottom section skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 bg-gray-200 rounded" />
          <div className="h-9 w-24 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading consultant information...</span>
    </div>
  );
};

export default SkeletonCard;
