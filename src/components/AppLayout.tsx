import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Home, Calendar, Users, BarChart3, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.jpg";

interface AppLayoutProps {
  children: ReactNode;
  role: "athlete" | "institution";
}

const athleteTabs = [
  { icon: Home, label: "Home", path: "/athlete" },
  { icon: Calendar, label: "Matches", path: "/athlete/matches" },
  { icon: Users, label: "Teams", path: "/athlete/teams" },
  { icon: BarChart3, label: "Analytics", path: "/athlete/analytics" },
  { icon: User, label: "Profile", path: "/athlete/profile" },
];

const institutionTabs = [
  { icon: Home, label: "Home", path: "/institution" },
  { icon: Calendar, label: "Matches", path: "/institution/matches" },
  { icon: Users, label: "Athletes", path: "/institution/athletes" },
  { icon: BarChart3, label: "Analytics", path: "/institution/analytics" },
  { icon: User, label: "Settings", path: "/institution/settings" },
];

const AppLayout = ({ children, role }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const tabs = role === "athlete" ? athleteTabs : institutionTabs;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Even Playground" className="h-7 w-7 rounded" />
            <span className="font-display font-bold text-foreground">Even Playground</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 container py-6 pb-24 md:pb-6">
        {children}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Nav */}
      <div className="hidden md:block fixed left-0 top-14 bottom-0 w-16 bg-card border-r border-border z-40">
        <div className="flex flex-col items-center gap-2 pt-4">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center gap-0.5 p-2 rounded-lg transition-colors w-12 ${
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
                title={tab.label}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[9px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
