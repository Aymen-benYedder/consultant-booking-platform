import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const ProfileModal = ({ isOpen, onClose, consultant, onBooking }) => {
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Cover Image */}
                <div className="relative h-48 bg-gradient-to-r from-sky-500 to-indigo-600">
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Profile Content */}
                <div className="px-6 pb-6">
                  {/* Profile Header */}
                  <div className="relative flex items-end space-x-5">
                    <div className="relative -mt-16">
                      <img
                        src={consultant?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(consultant?.name)}
                        alt={consultant?.name}
                        className="h-32 w-32 rounded-xl border-4 border-white object-cover shadow-lg"
                      />
                      {consultant?.isOnline && (
                        <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-green-400"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-2">
                      <h2 className="text-2xl font-bold text-gray-900 truncate">{consultant?.name}</h2>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-500">{consultant?.specialization}</p>
                        <span className="inline-flex items-center rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
                          {consultant?.experience} years exp.
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 pt-2">
                      <button
                        onClick={onBooking}
                        className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
                      >
                        Book Consultation
                      </button>
                    </div>
                  </div>

                  {/* Rating and Reviews */}
                  <div className="mt-6 flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(consultant?.rating || 0)
                              ? 'text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      ({consultant?.reviewCount} reviews)
                    </span>
                  </div>

                  {/* About Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">About</h3>
                    <p className="mt-2 text-gray-600">
                      {consultant?.about}
                    </p>
                  </div>

                  {/* Expertise */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Expertise</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {consultant?.expertise?.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Languages */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Languages</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {consultant?.languages?.map((language, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-800"
                        >
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recent Reviews */}
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900">Recent Reviews</h3>
                    <div className="mt-2 space-y-4">
                      {consultant?.recentReviews?.map((review, index) => (
                        <div key={index} className="border-t border-gray-200 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <img
                                src={review.userImage}
                                alt={review.userName}
                                className="h-8 w-8 rounded-full"
                              />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                                <p className="text-xs text-gray-500">{review.date}</p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-200'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal;
