import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorFallback: React.FC<{
  error: Error | null;
  errorInfo: ErrorInfo | null;
}> = ({ error, errorInfo }) => {
  const isDevelopment = import.meta.env.MODE !== 'production';

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white shadow-lg rounded-lg p-6'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          An Error Occurred
        </h2>
        <p className='text-gray-700 mb-4'>
          An unexpected error occurred. Please reload the page.
        </p>
        {isDevelopment && (
          <details className='mb-4'>
            <summary className='cursor-pointer text-blue-600 hover:text-blue-800'>
              Error Details (Dev Mode)
            </summary>
            <pre className='mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto'>
              {error?.toString()}
              {'\n\n'}
              {errorInfo?.componentStack}
            </pre>
          </details>
        )}
        <button
          onClick={() => window.location.reload()}
          className='w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Switched from class property initialization to a constructor. The previous approach
  // was causing typing issues in the environment, preventing access to `this.props`, `this.state`,
  // and `this.setState`. Using a constructor with `super(props)` is the standard and more compatible way
  // to initialize a React class component.
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    // In a production environment, you would send the error log to a service
    if (import.meta.env.MODE === 'production') {
      // e.g., send to Sentry, Firestore, or another error tracking service
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
        />
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
