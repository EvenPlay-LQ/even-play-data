import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Global Error Monitor - Captures and logs browser runtime errors
 * 
 * Add this component to your root App.tsx to monitor for actual browser console errors
 * 
 * Usage:
 * <ErrorMonitor />
 */
export const ErrorMonitor = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Capture unhandled errors
    const handleError = (event: ErrorEvent) => {
      console.error("🚨 Runtime Error Caught:", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });

      // Show user-friendly notification for critical errors
      if (event.error?.name === "TypeError" || event.error?.name === "ReferenceError") {
        toast({
          title: "Something went wrong",
          description: "An unexpected error occurred. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    // Capture unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("🚨 Unhandled Promise Rejection:", {
        reason: event.reason,
        type: event.type,
      });
    };

    // Register global error listeners
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, [toast]);

  // This component doesn't render anything
  return null;
};

export default ErrorMonitor;
