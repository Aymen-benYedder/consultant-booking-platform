import React from 'react';
import { Dialog } from '@headlessui/react';
import { GoogleLogin } from '@react-oauth/google';

const AuthPopup = ({ isOpen, onClose, onSuccess, onError }) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-[100]">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6">
          <Dialog.Title className="text-xl font-semibold text-center mb-6">
            Sign in to continue
          </Dialog.Title>
          
          <div className="text-center text-gray-600 mb-6">
            Please sign in to book an appointment with our consultants
          </div>

          <div className="flex justify-center mb-4">
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onError}
              useOneTap
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              width={280}
            />
          </div>

          <div className="text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AuthPopup;
