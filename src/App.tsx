import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import BuzzPage from "./pages/BuzzPage";
import CommunityPage from "./pages/CommunityPage";
import ZonePage from "./pages/ZonePage";
import ProfilePage from "./pages/ProfilePage";
import AthleteDashboard from "./pages/AthleteDashboard";
import InstitutionDashboard from "./pages/InstitutionDashboard";
import AthleteMatches from "./pages/dashboard/athlete/AthleteMatches";
import AthleteAnalytics from "./pages/dashboard/athlete/AthleteAnalytics";
import AthleteAchievements from "./pages/dashboard/athlete/AthleteAchievements";
import AthleteHighlights from "./pages/dashboard/athlete/AthleteHighlights";
import AthleteProfilePage from "./pages/dashboard/athlete/AthleteProfilePage";
import InstitutionAthletes from "./pages/dashboard/institution/InstitutionAthletes";
import InstitutionTeams from "./pages/dashboard/institution/InstitutionTeams";
import InstitutionMatches from "./pages/dashboard/institution/InstitutionMatches";
import InstitutionVerifications from "./pages/dashboard/institution/InstitutionVerifications";
import InstitutionAnalytics from "./pages/dashboard/institution/InstitutionAnalytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Community Layer (protected) */}
              <Route path="/buzz" element={<ProtectedRoute><BuzzPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
              <Route path="/zone" element={<ProtectedRoute><ZonePage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

              {/* Athlete Dashboard */}
              <Route path="/dashboard/athlete" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/athlete/matches" element={<ProtectedRoute><AthleteMatches /></ProtectedRoute>} />
              <Route path="/dashboard/athlete/analytics" element={<ProtectedRoute><AthleteAnalytics /></ProtectedRoute>} />
              <Route path="/dashboard/athlete/achievements" element={<ProtectedRoute><AthleteAchievements /></ProtectedRoute>} />
              <Route path="/dashboard/athlete/highlights" element={<ProtectedRoute><AthleteHighlights /></ProtectedRoute>} />
              <Route path="/dashboard/athlete/profile" element={<ProtectedRoute><AthleteProfilePage /></ProtectedRoute>} />

              {/* Institution Dashboard */}
              <Route path="/dashboard/institution" element={<ProtectedRoute><InstitutionDashboard /></ProtectedRoute>} />
              <Route path="/dashboard/institution/athletes" element={<ProtectedRoute><InstitutionAthletes /></ProtectedRoute>} />
              <Route path="/dashboard/institution/teams" element={<ProtectedRoute><InstitutionTeams /></ProtectedRoute>} />
              <Route path="/dashboard/institution/matches" element={<ProtectedRoute><InstitutionMatches /></ProtectedRoute>} />
              <Route path="/dashboard/institution/verifications" element={<ProtectedRoute><InstitutionVerifications /></ProtectedRoute>} />
              <Route path="/dashboard/institution/analytics" element={<ProtectedRoute><InstitutionAnalytics /></ProtectedRoute>} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
