import React, { useEffect, useState } from 'react';

const GoogleSignIn = ({ onSuccess, onError }) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const googleClientId = "362694203151-5saom7q8cus1usvaeap9rk814ughdo7v.apps.googleusercontent.com";

  useEffect(() => {
    // Only load if not already loaded
    if (!window.google && !isScriptLoaded) {
      window.onGoogleScriptLoad = () => {
        initializeGoogleSignIn();
        setIsScriptLoaded(true);
      };
      // Load the Google script
      window.loadGoogleScript();
    } else if (window.google) {
      initializeGoogleSignIn();
    }
  }, []);

  const initializeGoogleSignIn = () => {
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"),
      { theme: "outline", size: "large" }
    );
  };

  const handleCredentialResponse = (response) => {
    if (response.credential) {
      onSuccess(response);
    } else {
      onError(new Error('Google sign-in failed'));
    }
  };

  return (
    <div id="googleSignInButton" className="w-full flex justify-center"></div>
  );
};

export default React.memo(GoogleSignIn);
