import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-40 gap-6 text-center px-10">
          <div className="w-16 h-16 bg-red-400/10 rounded-full flex items-center justify-center text-red-400 mb-4">
             <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-black text-theme">Something went wrong</h2>
          <p className="text-muted text-sm max-w-md">The component crashed due to an unexpected error. This has been logged and we are looking into it.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-luxe mt-4"
          >
            RETURN HOME
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
