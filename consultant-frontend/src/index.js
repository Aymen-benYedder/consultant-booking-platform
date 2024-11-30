import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AppProvider } from './AppContext';

const GOOGLE_CLIENT_ID = "362694203151-5saom7q8cus1usvaeap9rk814ughdo7v.apps.googleusercontent.com";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppProvider>
        <App />
      </AppProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
