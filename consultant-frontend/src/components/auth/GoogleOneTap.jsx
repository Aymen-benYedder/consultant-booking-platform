import React, { useEffect, useContext } from 'react';
import { googleLogout, useGoogleOneTapLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AppContext } from '../../AppContext';

const GoogleOneTap = ({ onSuccess, showPrompt = true }) => {
  const { user, setUser } = useContext(AppContext);

  // Check if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useGoogleOneTapLogin({
    onSuccess: (credentialResponse) => {
      try {
        const decoded = jwtDecode(credentialResponse.credential);
        setUser(decoded);
        if (onSuccess) {
          onSuccess(decoded);
        }
      } catch (error) {
        console.error('Failed to decode Google credential:', error);
      }
    },
    onError: (error) => {
      console.error('Google One Tap Login failed:', error);
    },
    // FedCM configuration adjusted for desktop/mobile
    fedcm: {
      enabled: !isMobile, // Enable FedCM on desktop only
      mode: "auto",
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      provider: "https://accounts.google.com"
    },
    prompt_parent_id: 'oneTapPrompt',
    context: 'signin',
    cancel_on_tap_outside: true,
    hosted_domain: window.location.origin,
    // Enable on both desktop and mobile
    disabled: !showPrompt || !!user, // Disable if user is logged in or prompt is not needed
    auto_select: !isMobile, // Auto select account on desktop
    moment_callback: (notification) => {
      console.log('One Tap moment:', notification);
    },
    itp_support: true // Enable ITP support for Safari
  });

  useEffect(() => {
    if (!user && showPrompt) {
      // Create container for One Tap prompt
      const container = document.getElementById('oneTapPrompt') || document.createElement('div');
      container.id = 'oneTapPrompt';
      container.style.position = 'fixed';
      container.style.top = isMobile ? '24px' : '64px'; // Position higher on desktop
      container.style.right = isMobile ? '24px' : '24px';
      container.style.zIndex = '9999';
      
      if (!document.getElementById('oneTapPrompt')) {
        document.body.appendChild(container);
      }

      // Add meta tag for Google Sign-In
      const metaTag = document.createElement('meta');
      metaTag.name = 'google-signin-client_id';
      metaTag.content = process.env.REACT_APP_GOOGLE_CLIENT_ID;
      document.head.appendChild(metaTag);

      return () => {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
        if (document.head.contains(metaTag)) {
          document.head.removeChild(metaTag);
        }
      };
    }
  }, [user, showPrompt, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const container = document.getElementById('oneTapPrompt');
      if (container) {
        document.body.removeChild(container);
      }
      googleLogout();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Environment:', {
      isMobile,
      fedcmSupported: !!window.PublicKeyCredential,
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      origin: window.location.origin
    });
  }, [isMobile]);

  return null;
};

export default GoogleOneTap;
