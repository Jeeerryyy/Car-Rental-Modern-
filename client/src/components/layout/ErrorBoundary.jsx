import { Component } from 'react';
import { Link } from 'react-router-dom';
import { WarningIcon } from '../ui/Icons';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-off flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <WarningIcon className="w-16 h-16 text-muted mx-auto mb-4" />
          <h1 className="font-display text-3xl font-bold text-dark mb-3">Something went wrong</h1>
          <p className="text-muted mb-8 leading-relaxed">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => window.location.reload()} className="btn-primary">
              Refresh Page
            </button>
            <Link to="/" className="btn-outline" onClick={() => this.setState({ hasError: false })}>
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
