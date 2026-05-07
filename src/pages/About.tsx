import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Globe, ShieldCheck, Trophy, Users } from "lucide-react";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified by default",
    description:
      "Every stat, match result, and achievement on the platform passes through a verification pipeline involving institutions and officials.",
  },
  {
    icon: Globe,
    title: "Built for the global game",
    description:
      "From grassroots clubs in Soweto to academies in São Paulo — we're stitching together the long tail of sports data the major platforms ignore.",
  },
  {
    icon: Trophy,
    title: "Athlete-first, always",
    description:
      "Athletes own their profile and their data. Scouts and institutions earn access — they don't buy it.",
  },
  {
    icon: Users,
    title: "Community-powered",
    description:
      "Fans, coaches, and officials contribute the data that powers discovery. Everyone has a role in levelling the playing field.",
  },
];

const About = () => {
  return (
    <MarketingLayout>
      <SEO
        title="About | Even Playground"
        description="Even Playground is the global infrastructure for verified sports performance data — built for athletes, scouts, and institutions everywhere."
      />

      <section className="py-20 md:py-32 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              An <span className="text-primary">Even Playground</span> for every athlete.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're building the verified sports performance layer the rest of the world
              has been waiting for — open to grassroots, trusted by institutions, owned by athletes.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">Our story</h2>
          <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
            <p>
              Most of the world's sporting talent never gets seen. Stats live in coaches' notebooks,
              highlight reels sit on phones, and scouts only look where the cameras already point.
              Athletes outside elite academies are invisible by default.
            </p>
            <p>
              Even Playground started as a single question: what would it take to make every athlete's
              journey verifiable, portable, and discoverable — without forcing them through a gatekeeper?
            </p>
            <p>
              Today we're answering that question by building the data infrastructure underneath it:
              verified profiles, performance pipelines, and a community layer that rewards the people
              who already do this work for free.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">What we believe</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {PILLARS.map((p) => (
              <div key={p.title} className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Want to be part of it?</h2>
          <p className="text-muted-foreground mb-8">
            Whether you're an athlete, a club, a sponsor, or an investor — we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="hero" size="lg"><Link to="/contact">Get in touch</Link></Button>
            <Button asChild variant="outline" size="lg"><Link to="/careers">See careers</Link></Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default About;
