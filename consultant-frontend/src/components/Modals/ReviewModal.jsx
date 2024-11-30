import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

const ReviewModal = ({ isOpen, onClose, consultant, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ rating, review });
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Rate Your Experience
                </Dialog.Title>

                {/* Consultant Info */}
                <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={consultant?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(consultant?.name)}
                    alt={consultant?.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{consultant?.name}</h4>
                    <p className="text-sm text-gray-500">{consultant?.specialization}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center justify-center space-x-2 mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transform transition-transform hover:scale-110"
                    >
                      {star <= rating ? (
                        <StarIcon className="w-8 h-8 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="w-8 h-8 text-gray-300 hover:text-yellow-400" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Review Text */}
                <div className="mb-6">
                  <label
                    htmlFor="review"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Your Review
                  </label>
                  <textarea
                    id="review"
                    rows={4}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder="Share your experience with this consultant..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white ${
                      rating === 0
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-dark'
                    }`}
                    onClick={handleSubmit}
                    disabled={rating === 0 || isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReviewModal;
