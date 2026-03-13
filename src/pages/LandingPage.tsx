import { motion } from "framer-motion";
import { Trophy, BarChart3, Shield, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";

const features = [
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track every stat, every match, every improvement with real-time data visualization.",
  },
  {
    icon: Shield,
    title: "Verified Data",
    description: "Every performance stat is verified through our multi-layer verification system.",
  },
  {
    icon: Users,
    title: "Talent Discovery",
    description: "Connect institutions with athletes through structured, searchable performance data.",
  },
  {
    icon: Trophy,
    title: "Progression System",
    description: "Level up from Rookie to National Prospect based on verified performance metrics.",
  },
];

const stats = [
  { value: "10K+", label: "Athletes" },
  { value: "500+", label: "Institutions" },
  { value: "50K+", label: "Matches Tracked" },
  { value: "99.9%", label: "Data Accuracy" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Even Playground" className="h-8 w-8 rounded" />
            <span className="font-display font-bold text-xl text-foreground">Even Playground</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Sign In</Button>
            <Button variant="hero" size="sm" onClick={() => navigate("/login")}>Get Started</Button>
          </div>
          <Button variant="hero" size="sm" className="md:hidden" onClick={() => navigate("/login")}>Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-energy/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/10 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <img src={logo} alt="" className="h-4 w-4 rounded-sm" />
              <span className="text-xs font-medium text-primary">Sports Performance Data Platform</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight">
              Level Up Your{" "}
              <span className="text-gradient-energy">Sports Career</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              The centralized platform that aggregates, verifies, and analyzes sports performance data for athletes and institutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-base" onClick={() => navigate("/login")}>
                Join as Athlete <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="hero-outline"
                size="lg"
                className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => navigate("/login")}
              >
                Register Institution
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section id="stats" className="py-12 bg-card border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-energy">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for Sports Excellence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything athletes and institutions need to track, verify, and showcase performance.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border shadow-card hover:shadow-elevated hover:border-primary/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Play on an Even Field?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
            Join thousands of athletes and institutions already using Even Playground.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
            Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Even Playground" className="h-6 w-6 rounded" />
              <span className="font-display font-bold text-foreground">Even Playground</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 Even Playground. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
