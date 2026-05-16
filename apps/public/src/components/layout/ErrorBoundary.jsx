import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: '#F9F8F3' }}>
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-extrabold mb-4" style={{ color: '#19130E' }}>
              Something went wrong
            </h1>
            <p className="mb-8" style={{ color: '#6b5e50' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-[8px] font-bold text-sm"
              style={{ background: '#19130E', color: '#F9F8F3' }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
