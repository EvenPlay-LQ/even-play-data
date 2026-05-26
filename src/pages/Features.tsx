import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { FEATURE_SECTIONS } from "@/config/landing";
import {
  Newspaper, Users, Target, Activity, Trophy,
  BarChart2, Zap,
} from "lucide-react";
import BuzzFeedPreview from "@/components/BuzzFeedPreview";
import AnalyticsPreview from "@/components/AnalyticsPreview";

const Features = () => {
  return (
    <MarketingLayout>
      <SEO 
        title="Features | Even Playground"
        description="Explore the powerful tools and features built to empower the global sports community."
      />

      {/* Hero Section */}
      <section className="py-20 md:py-32 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Powerful Tools for the <br />
              <span className="text-primary">Evolving Athlete</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to track, verify, and showcase your performance, 
              all in one centralized platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Ecosystem */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {FEATURE_SECTIONS.map((feature, i) => {
              const icons = [Newspaper, Users, Target];
              const Icon = icons[i] || Zap;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-10 rounded-3xl bg-card border border-border shadow-card hover:shadow-elevated transition-all group overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-display font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">"{feature.description}"</p>
                  
                  {/* Detailed features bullet list */}
                   <ul className="space-y-4 pt-4 border-t border-border/50">
                    {feature.bullets.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-sm font-medium text-foreground/80">
                         <Zap className="h-3 w-3 text-primary" />
                         {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deep Dive Modules (Visual Inspiration from Dashboard) */}
      <section className="py-24 bg-muted/30 overflow-hidden">
        <div className="container">
          <div className="flex flex-col gap-32">
            {/* Feature 1: The Buzz */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-energy/10 mb-6 font-bold text-xs uppercase tracking-widest text-primary">
                   <Activity className="h-3.5 w-3.5" /> Live Information
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">The Buzz: Never Miss a Beat</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Catch the latest highlights, transfer news, and performance breakthroughs in a 
                  real-time feed designed for the sports community.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                      <h4 className="font-bold mb-2">Real-time Updates</h4>
                      <p className="text-xs text-muted-foreground">Stay informed with the latest match reports and scouting breakthroughs.</p>
                   </div>
                   <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
                      <h4 className="font-bold mb-2">Highlight Gallery</h4>
                      <p className="text-xs text-muted-foreground">Showcase your best moments with integrated video highlights.</p>
                   </div>
                </div>
              </motion.div>
              <BuzzFeedPreview />
            </div>

            {/* Feature 2: Performance Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-energy/10 mb-6 font-bold text-xs uppercase tracking-widest text-primary">
                   <BarChart2 className="h-3.5 w-3.5" /> Performance Data
                </div>
                <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Track Your Progress</h2>
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                  Log match reports, track skills progression, and earn XP. Our data engine
                  generates verified performance insights that build trust with institutions.
                </p>
                <ul className="space-y-4">
                   {[
                    "Self-logging with verification pipeline",
                    "Skills radar charts and progression lines",
                    "XP & Leveling system for motivation",
                    "Achievement badges and milestone tracking"
                   ].map(item => (
                     <li key={item} className="flex items-center gap-3 font-semibold text-foreground">
                        <Trophy className="h-4 w-4 text-primary" />
                        {item}
                     </li>
                   ))}
                </ul>
              </motion.div>
              <AnalyticsPreview />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Features;
