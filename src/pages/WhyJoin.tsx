import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { WHY_JOIN_CARDS } from "@/config/landing";
import { Rocket, ShieldCheck, CheckCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AthleteDashboardPreview, { type PillarId } from "@/components/AthleteDashboardPreview";

const PILLARS: { id: PillarId; icon: typeof Rocket; title: string; desc: string }[] = [
  {
    id: "verified",
    icon: ShieldCheck,
    title: "Verified Data Integrity",
    desc: "Every stat and achievement is verified by registered institutions, ensuring your profile is a trusted source of truth.",
  },
  {
    id: "discovery",
    icon: Search,
    title: "Talent Discovery",
    desc: "Search and compare athletes by sport, position, and stats. Your profile is discoverable to anyone who's looking — no gatekeepers, no geography.",
  },
  {
    id: "gamification",
    icon: Rocket,
    title: "Career-Focused Gamification",
    desc: "Level up your profile, earn performance badges, and track your growth with pro-level analytics tools.",
  },
];

const WhyJoin = () => {
  const navigate = useNavigate();
  const [activePillar, setActivePillar] = useState<PillarId>("gamification");
  const [pinned, setPinned] = useState(false);

  // Auto-cycle through pillars every 4s when nothing is hovered, so mobile/touch users see the link too.
  useEffect(() => {
    if (pinned) return;
    const order: PillarId[] = ["gamification", "verified", "discovery"];
    const id = window.setInterval(() => {
      setActivePillar((curr) => order[(order.indexOf(curr) + 1) % order.length]);
    }, 4000);
    return () => window.clearInterval(id);
  }, [pinned]);

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
              <Dialog key={card.title}>
                <DialogTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-elevated transition-all flex flex-col h-full cursor-pointer"
                  >
                    <div className={`w-14 h-14 rounded-2xl ${card.color.split(" ")[0]} flex items-center justify-center mb-6`}>
                      <card.icon className={`h-7 w-7 ${card.color.split(" ")[1]}`} />
                    </div>
                    <h3 className="text-xl font-display font-bold mb-4">{card.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{card.description}</p>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <div className={`w-12 h-12 rounded-xl ${card.color.split(" ")[0]} flex items-center justify-center mb-4`}>
                      <card.icon className={`h-6 w-6 ${card.color.split(" ")[1]}`} />
                    </div>
                    <DialogTitle className="text-2xl">{card.title} Account</DialogTitle>
                    <DialogDescription className="text-base pt-2">
                      {card.description}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <h4 className="font-semibold mb-3 text-foreground">How it works:</h4>
                    <ul className="space-y-3">
                      {card.details?.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-primary shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button onClick={() => navigate(`/login?mode=signup`)}>
                      Get Started as {card.title}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
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
              <div className="space-y-3" onMouseLeave={() => setPinned(false)}>
                {PILLARS.map((pillar) => {
                  const isActive = activePillar === pillar.id;
                  return (
                    <button
                      key={pillar.id}
                      type="button"
                      onMouseEnter={() => { setActivePillar(pillar.id); setPinned(true); }}
                      onFocus={() => { setActivePillar(pillar.id); setPinned(true); }}
                      onClick={() => { setActivePillar(pillar.id); setPinned(true); }}
                      aria-pressed={isActive}
                      className={`w-full text-left flex gap-4 p-4 rounded-xl border transition-all duration-300 ${
                        isActive
                          ? "border-primary/40 bg-primary/5 shadow-card"
                          : "border-transparent bg-transparent hover:border-border hover:bg-muted/30"
                      }`}
                    >
                      <div className={`mt-1 p-2 rounded-lg h-fit transition-colors duration-300 ${
                        isActive ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                      }`}>
                        <pillar.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg mb-1 text-foreground">{pillar.title}</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            <AthleteDashboardPreview activePillar={activePillar} />
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default WhyJoin;
