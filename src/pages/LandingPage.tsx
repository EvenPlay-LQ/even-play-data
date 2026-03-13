import { motion } from "framer-motion";
import {
  ArrowRight, Award, CheckCircle, Globe, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.jpg";
import { LANDING_STATS, WHY_JOIN_CARDS, FEATURE_SECTIONS, FOOTER_LINKS } from "@/config/landing";

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
            <a href="#why" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Why Join</a>
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
          <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-stat-blue/5 rounded-full blur-2xl" />
        </div>
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-primary">Join the Ultimate Sports Community</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-primary-foreground mb-6 leading-tight">
              Where Sports Data{" "}
              <span className="text-gradient-energy">Meets Truth</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-2xl mx-auto">
              The centralized platform that aggregates, verifies, and distributes sports performance data for athletes, institutions, and fans worldwide.
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
            {LANDING_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-3xl md:text-4xl font-display font-bold text-gradient-energy">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join */}
      <section id="why" className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why Join Even Playground?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Whether you're an athlete, fan, coach, or official — there's a place for you.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_JOIN_CARDS.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color.split(" ")[0]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`h-6 w-6 ${item.color.split(" ")[1]}`} />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* See What's Inside */}
      <section id="features" className="py-20 md:py-32 bg-muted/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              See What's Inside
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three powerful sections to explore the world of sports data.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURE_SECTIONS.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border shadow-elevated group"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{feature.description}</p>
                  <Button variant="ghost" size="sm" className="text-primary p-0 h-auto hover:bg-transparent" onClick={() => navigate("/login")}>
                    Explore <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-20 md:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-2xl bg-gradient-hero p-8 md:p-12 shadow-elevated relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-energy/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 mb-4">
                  <Award className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">Featured Story</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-3">
                  Youth Athletes Breaking Records Across Southern Africa
                </h3>
                <p className="text-primary-foreground/60 mb-6 max-w-2xl">
                  From school-level to academy standouts, a new generation of verified talent is emerging. Even Playground tracks every stat, every milestone, every breakthrough.
                </p>
                <div className="flex items-center gap-6 text-xs text-primary-foreground/40">
                  <span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> 2.4K views</span>
                  <span>48 comments</span>
                  <span>312 likes</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to Play on an Even Field?
            </h2>
            <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto">
              Join thousands of athletes and institutions already using Even Playground to track, verify, and showcase sports performance.
            </p>
            <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-card border-t border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logo} alt="Even Playground" className="h-6 w-6 rounded" />
                <span className="font-display font-bold text-foreground">Even Playground</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The centralized sports data platform that aggregates, verifies, and distributes performance data.
              </p>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Quick Links</h4>
              <div className="space-y-2">
                {FOOTER_LINKS.quickLinks.map((link) => (
                  <button key={link} className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/login")}>
                    {link}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">For Athletes</h4>
              <div className="space-y-2">
                {FOOTER_LINKS.forAthletes.map((link) => (
                  <button key={link} className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/login")}>{link}</button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4">Support</h4>
              <div className="space-y-2">
                {FOOTER_LINKS.support.map((link) => (
                  <button key={link} className="block text-sm text-muted-foreground hover:text-foreground transition-colors" onClick={() => navigate("/login")}>{link}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">© 2026 Even Playground. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Privacy</span>
              <span>Terms</span>
              <span>Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;