import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { WHY_JOIN_CARDS } from "@/config/landing";
import { CheckCircle2, Zap, Rocket, Globe, ShieldCheck } from "lucide-react";

const WhyJoin = () => {
  return (
    <MarketingLayout>
      <SEO 
        title="Why Join | Even Playground"
        description="Discover the benefits of joining the global infrastructure for verified sports performance data."
      />
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="container relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-display font-bold text-primary-foreground mb-6">
              Empowering the Next <br />
              <span className="text-gradient-energy">Generation of Talent</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto leading-relaxed">
              Even Playground is more than a platform — it's a movement to bring transparency, 
              verification, and global visibility to grassroots sports worldwide.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Persona Benefits Grid */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">Built for Everyone In the Game</h2>
            <p className="text-muted-foreground">Tailored experiences for every role in the sports ecosystem.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {WHY_JOIN_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-all flex flex-col h-full"
              >
                <div className={`w-14 h-14 rounded-2xl ${card.color} flex items-center justify-center mb-6`}>
                  <card.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-display font-bold mb-4">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-8">
                Why Even Playground <br /> is a Game Changer
              </h2>
              <div className="space-y-8">
                {[
                  { 
                    icon: ShieldCheck, 
                    title: "Verified Data Integrity", 
                    desc: "Every stat and achievement is verified by registered institutions, ensuring your profile is a trusted source of truth." 
                  },
                  { 
                    icon: Globe, 
                    title: "Global Scouting Pipeline", 
                    desc: "Access a worldwide network of scouts and clubs. Your talent is no longer limited by your geography." 
                  },
                  { 
                    icon: Rocket, 
                    title: "Career-Focused Gamification", 
                    desc: "Level up your profile, earn performance badges, and track your growth with pro-level analytics tools." 
                  }
                ].map((pillar, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-lg h-fit">
                      <pillar.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{pillar.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
               <div className="aspect-square bg-gradient-hero rounded-3xl p-8 flex items-center justify-center overflow-hidden shadow-2xl">
                  {/* Decorative element imagining a dashboard card */}
                  <div className="w-full h-full bg-card rounded-2xl shadow-elevated border border-border p-6 flex flex-col gap-4 transform rotate-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">JD</div>
                      <div>
                         <div className="h-4 w-32 bg-muted rounded mb-2" />
                         <div className="h-3 w-20 bg-muted/60 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                       <div className="h-24 bg-primary/5 rounded-xl border border-primary/10 flex flex-col items-center justify-center p-3">
                          <Zap className="h-5 w-5 text-primary mb-2" />
                          <div className="h-3 w-12 bg-primary/20 rounded" />
                       </div>
                       <div className="h-24 bg-gold/5 rounded-xl border border-gold/10 flex flex-col items-center justify-center p-3">
                          <CheckCircle2 className="h-5 w-5 text-gold mb-2" />
                          <div className="h-3 w-12 bg-gold/20 rounded" />
                       </div>
                    </div>
                    <div className="mt-4 flex-1 bg-muted/20 rounded-xl p-4 flex items-end">
                       <div className="h-2 w-full bg-primary/40 rounded-full" />
                    </div>
                  </div>
               </div>
               <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default WhyJoin;
