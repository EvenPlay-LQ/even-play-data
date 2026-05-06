import { ReactNode } from "react";
import { MarketingNavbar } from "./MarketingNavbar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { FOOTER_LINKS } from "@/config/landing";
import { InstallButton } from "@/components/InstallButton";

interface MarketingLayoutProps {
  children: ReactNode;
}

export const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketingNavbar />
      
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Shared CTA Section */}
      <section className="py-20 bg-primary/5 border-y border-border">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-foreground">
            Ready to Start Your Journey?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" onClick={() => navigate("/login?mode=login")}>
              Sign In
            </Button>
            <Button variant="hero-outline" size="lg" onClick={() => navigate("/login?mode=signup")}>
              Get Started
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card border-t border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <div className="col-span-2 md:col-span-1">
              <div className="font-display font-bold text-xl mb-6 flex items-center gap-2">
                Even Playground
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The global infrastructure for verified sports performance data. Built for athletes, scouts, and institutions.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Explore</h4>
              <ul className="space-y-4">
                {FOOTER_LINKS.explore.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Company</h4>
              <ul className="space-y-4">
                {FOOTER_LINKS.company.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-6">Support</h4>
              <ul className="space-y-4">
                {FOOTER_LINKS.support.map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">© 2026 Even Playground. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <InstallButton />
              <Link to="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors">Contact</Link>
              <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
