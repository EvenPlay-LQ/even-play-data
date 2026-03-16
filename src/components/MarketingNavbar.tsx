import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import logo from "@/assets/logo.jpg";

export const MarketingNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Why Join", href: "/why-join" },
    { label: "Features", href: "/features" },
    { label: "Stats", href: "/stats" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="Even Playground" className="h-8 w-8 rounded" />
          <span className="font-display font-bold text-xl text-foreground">Even Playground</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/login")}>Get Started</Button>
        </div>
        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-display font-semibold text-foreground">Menu</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1">
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-foreground hover:text-primary transition-colors py-2 border-b border-border/50"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="outline" size="sm" className="w-full" onClick={() => navigate("/login")}>
                  Sign In
                </Button>
                <Button variant="hero" size="sm" className="w-full" onClick={() => navigate("/login")}>
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
