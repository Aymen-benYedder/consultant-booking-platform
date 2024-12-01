export const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
  }
  return 'http://194.164.203.235:8000/api';
};

export const getBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return process.env.REACT_APP_BASE_URL || 'http://localhost:3000';
  }
  return 'http://194.164.203.235';
};
