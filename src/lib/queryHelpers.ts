import { toast } from "@/hooks/use-toast";

export const handleQueryError = (error: unknown, fallbackMessage = "Failed to load data. Please try again.") => {
  console.error("Query error:", error);
  
  let errorMessage = fallbackMessage;
  if (error && typeof error === 'object') {
    if ('message' in error && typeof (error as any).message === 'string') {
      errorMessage = (error as any).message;
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  toast({
    title: "Error",
    description: errorMessage,
    variant: "destructive",
  });
};
