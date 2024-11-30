import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const AuthButtons = ({ onGoogleLogin, onGoogleFailure, onSimulateSession }) => {
    return (
        <>
            <GoogleLogin
                size='medium'
                width='120px'
                onSuccess={onGoogleLogin}
                onFailure={onGoogleFailure}
                logo="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                className="flex items-center bg-white text-gray-800 text-xs px-2 py-1 rounded shadow hover:bg-gray-200 transition duration-200"
            >
                Google
            </GoogleLogin>
            <button
                onClick={onSimulateSession}
                className="ml-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            >
                Simulate Client Session
            </button>
        </>
    );
};

export default AuthButtons;
