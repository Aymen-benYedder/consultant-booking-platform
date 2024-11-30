import React, { useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';

const GoogleOneTapWrapper = ({ onSuccess, onClose }) => {
    const { login } = useContext(AppContext);

    useEffect(() => {
        // Load the Google Sign-In script
        const loadGoogleScript = () => {
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.body.appendChild(script);

            return script;
        };

        // Initialize Google One Tap
        const initializeGoogleOneTap = () => {
            if (!window.google) return;

            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
                auto_select: true,
                cancel_on_tap_outside: false
            });

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    console.log('One Tap was not displayed:', notification.getNotDisplayedReason());
                }
            });
        };

        // Handle the credential response
        const handleCredentialResponse = (response) => {
            try {
                const { credential } = response;
                const payload = credential ? JSON.parse(atob(credential.split('.')[1])) : null;
                
                if (payload) {
                    const userData = {
                        email: payload.email,
                        name: payload.name,
                        picture: payload.picture,
                        id: payload.sub,
                    };
                    login(userData);
                    onSuccess?.(userData);
                }
            } catch (error) {
                console.error('Error processing Google response:', error);
                onClose?.();
            }
        };

        // Cleanup existing elements
        const googleOneTabScript = document.querySelector('iframe[src*="https://accounts.google.com/gsi/"]');
        if (googleOneTabScript) {
            googleOneTabScript.remove();
        }

        // Load and initialize
        const script = loadGoogleScript();
        script.onload = initializeGoogleOneTap;

        // Cleanup on unmount
        return () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.cancel();
            }
            document.getElementById('credential_picker_container')?.remove();
            script.remove();
        };
    }, [login, onSuccess, onClose]);

    return null;
};

export default GoogleOneTapWrapper;
