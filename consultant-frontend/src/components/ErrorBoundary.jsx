import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';

/**
 * Error Boundary Component
 * Displays user-friendly error messages and provides recovery options
 */
class ErrorBoundaryBase extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    const { error: stateError } = this.state;
    const { routeError, fallback } = this.props;
    const error = routeError || stateError;

    if (this.state.hasError || routeError) {
      if (fallback) {
        return fallback(error);
      }

      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4" role="alert">
          <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isRouteErrorResponse(error) ? 'Page Not Found' : 'Something went wrong'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error?.message || 'An unexpected error occurred'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                aria-label="Refresh page"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Go to home page"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundaryBase.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  routeError: PropTypes.any
};

// Route error boundary component
function RouteErrorBoundary(props) {
  const routeError = useRouteError();
  return <ErrorBoundaryBase {...props} routeError={routeError} />;
}

// Regular error boundary component
function ErrorBoundary(props) {
  return <ErrorBoundaryBase {...props} />;
}

// Export both components to use the appropriate one based on context
export { RouteErrorBoundary };
export default ErrorBoundary;