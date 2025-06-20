import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../design-system/components/Button';

interface Props {
  children: ReactNode;
  FallbackComponent?: ReactNode; // Optional custom fallback component
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: undefined,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleResetError = () => {
    // Attempt to reset the error state. This might not always work if the underlying issue persists.
    // A better approach for "retry" might involve re-triggering an action or navigating away.
    // For a simple visual reset:
    this.setState({ hasError: false, error: undefined });
    // It's often better to encourage a page refresh or navigation.
    // window.location.reload(); 
    // Or if you have a way to re-fetch data or re-initialize the problematic component, call that.
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.FallbackComponent) {
        return this.props.FallbackComponent;
      }
      return (
        <div className="p-4 m-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg shadow-md text-center">
          <AlertTriangle size={48} className="mx-auto mb-3 text-red-500" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Oops! Something went wrong.</h2>
          <p className="text-red-600 dark:text-red-400 mb-3">
            We've encountered an issue with this part of the application.
          </p>
          {this.state.error && (
             <details className="text-xs text-left text-red-500 dark:text-red-500 bg-red-100 dark:bg-red-800 p-2 rounded mb-3">
                <summary className="cursor-pointer">Error Details (for developers)</summary>
                <pre className="mt-1 whitespace-pre-wrap break-all">
                    {this.state.error.name}: {this.state.error.message}
                    {/* Stack trace can be very long, consider omitting or truncating for UI */}
                    {/* {this.state.error.stack && `\n${this.state.error.stack}`} */}
                </pre>
             </details>
          )}
          <Button onClick={() => window.location.reload()} variant="danger">
            Refresh Page
          </Button>
          {/* 
          <Button onClick={this.handleResetError} variant="outline" className="ml-2">
            Try to Reset Component (Experimental)
          </Button>
          */}
          <p className="text-xs text-red-400 dark:text-red-500 mt-2">If the problem persists, please try refreshing or contact support.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
