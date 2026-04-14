import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, Calendar, Users, BarChart3, User, Shield, LogOut, Trophy, Video,
  Building2, CheckCircle, FileText, ShieldCheck, Activity, ScrollText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import logo from "@/assets/logo.jpg";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "athlete" | "institution" | "master_admin" | "parent";
}

const athleteTabs = [
  { icon: Home, label: "Overview", path: "/dashboard/athlete" },
  { icon: Calendar, label: "Matches", path: "/dashboard/athlete/matches" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/athlete/analytics" },
  { icon: Trophy, label: "Achievements", path: "/dashboard/athlete/achievements" },
  { icon: Video, label: "Highlights", path: "/dashboard/athlete/highlights" },
  { icon: User, label: "Profile", path: "/dashboard/athlete/profile" },
];

const institutionTabs = [
  { icon: Home, label: "Overview", path: "/dashboard/institution" },
  { icon: Users, label: "Athletes", path: "/dashboard/institution/athletes" },
  { icon: Building2, label: "Teams", path: "/dashboard/institution/teams" },
  { icon: Calendar, label: "Matches", path: "/dashboard/institution/matches" },
  { icon: CheckCircle, label: "Verify", path: "/dashboard/institution/verifications" },
  { icon: BarChart3, label: "Analytics", path: "/dashboard/institution/analytics" },
];

const parentTabs = [
  { icon: Home, label: "Overview", path: "/dashboard/parent" },
  { icon: Users, label: "My Athletes", path: "/dashboard/parent" },
  { icon: Activity, label: "Activity Tracker", path: "/dashboard/parent" },
];

const masterAdminTabs = [
  { icon: Home, label: "Overview", path: "/admin" },
  { icon: Users, label: "Users", path: "/admin/users" },
  { icon: Activity, label: "Diagnostics", path: "/admin/diagnostics" },
  { icon: ScrollText, label: "Audit", path: "/admin/audit" },
];

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  
  const tabs = 
    role === "master_admin" ? masterAdminTabs : 
    role === "athlete" ? athleteTabs : 
    role === "parent" ? parentTabs : 
    institutionTabs;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="Even Playground" className="h-7 w-7 rounded" />
              <span className="font-display font-bold text-foreground">Even Playground</span>
            </div>
            <div className="hidden md:flex items-center gap-1 ml-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                role === "master_admin" 
                  ? "bg-red-500/20 text-red-500 border border-red-500/20" 
                  : "bg-primary/10 text-primary"
              }`}>
                {role === "master_admin" ? "Master Admin" : role === "parent" ? "Parent / Guardian" : `${role} Dashboard`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => navigate("/buzz")}>
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Community</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6 md:pl-20">
        {children}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center gap-1 min-w-[60px] py-1.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed left-0 top-14 bottom-0 w-20 bg-card border-r border-border z-40 flex-col items-center pt-6 gap-3">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all w-16 ${
                isActive ? "bg-primary/10 text-primary shadow-glow" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
              title={tab.label}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardLayout;
