import { toast } from "@/hooks/use-toast";

export const handleQueryError = (error: unknown, fallbackMessage = "Failed to load data. Please try again.") => {
  console.error("Query error:", error);
  toast({
    title: "Error",
    description: fallbackMessage,
    variant: "destructive",
  });
};
