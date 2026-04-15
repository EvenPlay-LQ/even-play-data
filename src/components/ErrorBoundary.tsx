import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, WifiOff, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
}

function isNetworkError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    !navigator.onLine ||
    message.includes("fetch") ||
    message.includes("network") ||
    message.includes("failed to fetch") ||
    message.includes("load failed")
  );
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isNetworkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isNetworkError: isNetworkError(error),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, isNetworkError: false });
  };

  render() {
    if (this.state.hasError) {
      // Offline / network error UI
      if (this.state.isNetworkError) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                <WifiOff className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-2">You're offline</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Connect to the internet to access this page.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </Button>
                <Button onClick={() => window.location.reload()} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        );
      }

      // Generic error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="default" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
