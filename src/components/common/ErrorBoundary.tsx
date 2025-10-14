import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Explicitly declare state as public. While this is the default, some toolchains might misinterpret the class structure without it.
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  // FIX: Explicitly declare static method as public for consistency.
  public static getDerivedStateFromError(error: Error): Partial<State> {
    // This static method runs first when an error is thrown.
    // It should return a state update object.
    return { hasError: true, error };
  }

  // FIX: Reverted to a standard class method. Lifecycle methods are automatically bound by React, so `this` is correctly typed.
  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // This lifecycle method is for side effects like logging.
    // We can also set state here.
    this.setState({
      errorInfo
    });

    // In a production environment, you would send the error log to a service
    if (process.env.NODE_ENV === 'production') {
      // e.g., send to Sentry, Firestore, or another error tracking service
    }
  }

  // FIX: Reverted to a standard class method to ensure `this.props` and `this.state` are correctly typed from the base `Component` class.
  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              エラーが発生しました
            </h2>
            <p className="text-gray-700 mb-4">
              申し訳ございません。予期しないエラーが発生しました。
            </p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4">
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                  エラー詳細（開発モード）
                </summary>
                <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              ページを再読み込み
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
