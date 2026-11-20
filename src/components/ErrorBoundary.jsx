import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[4Core Exim] Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white border border-brand-gray-200 rounded-xl p-8 shadow-sm text-center">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-xl" />
            </div>
            <h2 className="text-lg font-extrabold text-brand-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-xs text-brand-gray-600 mb-4 leading-relaxed">
              {this.state.error?.message || 'An unexpected error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-brand-green-600 hover:bg-brand-green-700 text-white text-xs font-bold rounded transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
            >
              <FiRefreshCw className="text-xs" />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
