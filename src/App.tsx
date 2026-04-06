import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import GuestRoute from "@/components/GuestRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Code Splitting - Lazy Loading Pages
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage"));
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
const AttendanceTracker = lazy(() => import("./pages/dashboard/institution/AttendanceTracker"));
const InstitutionAnnouncements = lazy(() => import("./pages/dashboard/institution/InstitutionAnnouncements"));
const FixtureScheduler = lazy(() => import("./pages/dashboard/institution/FixtureScheduler"));
const ComplianceDocuments = lazy(() => import("./pages/dashboard/institution/ComplianceDocuments"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminDiagnostics = lazy(() => import("./pages/admin/AdminDiagnostics"));
const AdminAuditLog = lazy(() => import("./pages/admin/AdminAuditLog"));

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
                <Route path="/" element={<GuestRoute><LandingPage /></GuestRoute>} />
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/why-join" element={<WhyJoin />} />
                <Route path="/features" element={<Features />} />
                <Route path="/stats" element={<Stats />} />

                {/* Community Layer (protected) */}
                <Route path="/buzz" element={<ProtectedRoute><BuzzPage /></ProtectedRoute>} />
                <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
                <Route path="/zone" element={<ProtectedRoute><ZonePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/setup" element={<ProtectedRoute><SignupWizard /></ProtectedRoute>} />

                {/* Athlete Dashboard */}
                <Route path="/dashboard/athlete" element={<ProtectedRoute requiredRole="athlete"><AthleteDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/athlete/matches" element={<ProtectedRoute requiredRole="athlete"><AthleteMatches /></ProtectedRoute>} />
                <Route path="/dashboard/athlete/analytics" element={<ProtectedRoute requiredRole="athlete"><AthleteAnalytics /></ProtectedRoute>} />
                <Route path="/dashboard/athlete/achievements" element={<ProtectedRoute requiredRole="athlete"><AthleteAchievements /></ProtectedRoute>} />
                <Route path="/dashboard/athlete/highlights" element={<ProtectedRoute requiredRole="athlete"><AthleteHighlights /></ProtectedRoute>} />
                <Route path="/dashboard/athlete/profile" element={<ProtectedRoute requiredRole="athlete"><AthleteProfilePage /></ProtectedRoute>} />

                {/* Institution Dashboard */}
                <Route path="/dashboard/institution" element={<ProtectedRoute requiredRole="institution"><InstitutionDashboard /></ProtectedRoute>} />
                <Route path="/dashboard/institution/athletes" element={<ProtectedRoute requiredRole="institution"><InstitutionAthletes /></ProtectedRoute>} />
                <Route path="/dashboard/institution/teams" element={<ProtectedRoute requiredRole="institution"><InstitutionTeams /></ProtectedRoute>} />
                <Route path="/dashboard/institution/matches" element={<ProtectedRoute requiredRole="institution"><FixtureScheduler /></ProtectedRoute>} />
                <Route path="/dashboard/institution/verifications" element={<ProtectedRoute requiredRole="institution"><InstitutionVerifications /></ProtectedRoute>} />
                <Route path="/dashboard/institution/analytics" element={<ProtectedRoute requiredRole="institution"><InstitutionAnalytics /></ProtectedRoute>} />
                <Route path="/dashboard/institution/attendance" element={<ProtectedRoute requiredRole="institution"><AttendanceTracker /></ProtectedRoute>} />
                <Route path="/dashboard/institution/announcements" element={<ProtectedRoute requiredRole="institution"><InstitutionAnnouncements /></ProtectedRoute>} />
                <Route path="/dashboard/institution/compliance" element={<ProtectedRoute requiredRole="institution"><ComplianceDocuments /></ProtectedRoute>} />

                {/* Parent Dashboard */}
                <Route path="/dashboard/parent" element={<ProtectedRoute requiredRole="parent"><ParentDashboard /></ProtectedRoute>} />

                {/* Master Admin Console */}
                <Route path="/admin" element={<ProtectedRoute requiredRole="master_admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="master_admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/diagnostics" element={<ProtectedRoute requiredRole="master_admin"><AdminDiagnostics /></ProtectedRoute>} />
                <Route path="/admin/audit" element={<ProtectedRoute requiredRole="master_admin"><AdminAuditLog /></ProtectedRoute>} />

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
