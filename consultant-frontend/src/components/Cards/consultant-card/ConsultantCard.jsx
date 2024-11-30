import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import ConsultantModal from '../../Modals/consultant-modal/ConsultantModal';
import ImageSection from './ImageSection';
import ContentSection from './ContentSection';
import SkeletonCard from './SkeletonCard';

const ConsultantCard = memo(({ consultant, index, priority = false, isLoading = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  if (!consultant || isLoading) {
    return <SkeletonCard />;
  }

  const handleCardClick = (e) => {
    // Prevent navigation if clicking the favorite button or book button
    if (e.target.closest('button')) {
      return;
    }
    navigate(`/consultant/${consultant._id}`);
  };

  return (
    <>
      <div 
        onClick={handleCardClick}
        className="w-72 bg-white shadow-md rounded-xl duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer group relative isolate overflow-hidden"
      >
        <ImageSection
          consultant={consultant}
          isFavorite={isFavorite}
          setIsFavorite={setIsFavorite}
          index={index}
          priority={priority}
        />
        <ContentSection
          consultant={consultant}
          onBookClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
        />

        {/* Hover Highlight Effect */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/0 via-primary/0 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <ConsultantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consultantId={consultant._id}
      />
    </>
  );
});

ConsultantCard.displayName = 'ConsultantCard';

export default ConsultantCard;
