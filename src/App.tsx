import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Code Splitting - Lazy Loading Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const WhyJoin = lazy(() => import("./pages/WhyJoin"));
const Features = lazy(() => import("./pages/Features"));
const Stats = lazy(() => import("./pages/Stats"));
const BuzzPage = lazy(() => import("./pages/BuzzPage"));
const CommunityPage = lazy(() => import("./pages/CommunityPage"));
const ZonePage = lazy(() => import("./pages/ZonePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SignupWizard = lazy(() => import("./pages/SignupWizard"));
const AthleteDashboard = lazy(() => import("./pages/AthleteDashboard"));
const InstitutionDashboard = lazy(() => import("./pages/InstitutionDashboard"));
const AthleteMatches = lazy(() => import("./pages/dashboard/athlete/AthleteMatches"));
const AthleteAnalytics = lazy(() => import("./pages/dashboard/athlete/AthleteAnalytics"));
const AthleteAchievements = lazy(() => import("./pages/dashboard/athlete/AthleteAchievements"));
const AthleteHighlights = lazy(() => import("./pages/dashboard/athlete/AthleteHighlights"));
const AthleteProfilePage = lazy(() => import("./pages/dashboard/athlete/AthleteProfilePage"));
const InstitutionAthletes = lazy(() => import("./pages/dashboard/institution/InstitutionAthletes"));
const InstitutionTeams = lazy(() => import("./pages/dashboard/institution/InstitutionTeams"));
const InstitutionMatches = lazy(() => import("./pages/dashboard/institution/InstitutionMatches"));
const InstitutionVerifications = lazy(() => import("./pages/dashboard/institution/InstitutionVerifications"));
const InstitutionAnalytics = lazy(() => import("./pages/dashboard/institution/InstitutionAnalytics"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/why-join" element={<WhyJoin />} />
                <Route path="/features" element={<Features />} />
                <Route path="/stats" element={<Stats />} />

                {/* Community Layer (protected) */}
                <Route path="/buzz" element={<ProtectedRoute><BuzzPage /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/zone" element={<ProtectedRoute><ZonePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/setup" element={<ProtectedRoute><SignupWizard /></ProtectedRoute>} />

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
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
