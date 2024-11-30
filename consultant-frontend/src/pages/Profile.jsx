import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  CameraIcon,
  UserCircleIcon,
  EnvelopeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, setUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    avatar: null
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/');
    } else {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || null
      });
      setImagePreview(user.avatar || null);
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          avatar: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.avatar instanceof File) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const response = await api.updateProfile(formDataToSend);
      setUser(response);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError('Failed to update profile');
      console.error('Profile update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      avatar: user.avatar || null
    });
    setImagePreview(user.avatar || null);
    setError(null);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your personal information and preferences
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            {isEditing ? (
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="inline-flex items-center rounded-lg border border-transparent bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  <XMarkIcon className="h-4 w-4 mr-1" />
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-sky-500 to-indigo-600 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          <form onSubmit={handleSubmit} className="relative px-4 sm:px-6 lg:px-8 pb-8">
            {/* Profile Picture */}
            <div className="relative inline-block -mt-16 mb-4">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={formData.name}
                    className="w-32 h-32 rounded-xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-32 h-32 text-gray-300" />
                )}
                {isEditing && (
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-2 right-2 p-2 rounded-full bg-white shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <CameraIcon className="w-5 h-5 text-gray-600" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <XMarkIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6 max-w-2xl">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                      placeholder="Enter your name"
                    />
                  ) : (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-2">
                        <UserCircleIcon className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-900">{formData.name || 'Not set'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 text-gray-500 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"
                  />
                </div>
              </div>

              {/* Member Since */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Member Since
                </label>
                <div className="mt-1 flex items-center space-x-2">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500 text-sm">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
