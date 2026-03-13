import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import AthleteDashboard from "./pages/AthleteDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard/athlete" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/athlete/*" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/institution" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/institution/*" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
            {/* Legacy routes redirect */}
            <Route path="/athlete" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
            <Route path="/athlete/*" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
            <Route path="/institution" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
            <Route path="/institution/*" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
