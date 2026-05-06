import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Code, Database, Heart, Megaphone } from "lucide-react";
import { CONTACT_EMAIL, buildMailto } from "@/lib/contact";

const FUTURE_ROLES = [
  {
    icon: Code,
    title: "Senior frontend engineer",
    description: "React, TypeScript, building athlete- and institution-facing tools at production scale.",
    tags: ["React", "TypeScript", "PWA"],
  },
  {
    icon: Database,
    title: "Backend / data engineer",
    description: "Supabase, Postgres, RLS, performance pipelines that turn raw match data into verified stats.",
    tags: ["Postgres", "Supabase", "Edge Functions"],
  },
  {
    icon: Megaphone,
    title: "Sports data partnerships",
    description: "Federations, clubs, academies — the relationships that make our data trustable.",
    tags: ["Partnerships", "Sport ops"],
  },
  {
    icon: Heart,
    title: "Community manager",
    description: "Athletes, fans, officials. Run the heartbeat of the platform.",
    tags: ["Community", "Content"],
  },
];

const Careers = () => {
  const introduceYourself = (role: string) =>
    buildMailto(
      `Future role: ${role}`,
      `Hi Even Playground team,\n\nI'd love to be considered for the ${role} role when you start hiring. A bit about me:\n\n— `,
      "careers@evenplayground.com"
    );

  return (
    <MarketingLayout>
      <SEO
        title="Careers | Even Playground"
        description="No open positions today — but if you want to help build the global infrastructure for sports data, we'd love to hear from you."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Build with us.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We're a small team levelling the playing field for global sports talent. We're not hiring
              today — but if any of these roles sound like you, get on the list.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          <div className="p-6 mb-12 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-2">Current openings</p>
            <p className="text-foreground">
              <strong>None right now.</strong> If you'd like us to reach out when this changes,
              email <a href={`mailto:careers@evenplayground.com`} className="text-primary hover:underline">careers@evenplayground.com</a>.
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Roles we'd hire for next</h2>
          <p className="text-muted-foreground mb-12">
            These aren't open positions. They're the shape of the team we're building toward.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {FUTURE_ROLES.map((r) => (
              <div key={r.title} className="p-8 rounded-2xl bg-card border border-border shadow-sm flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">{r.title}</h3>
                <p className="text-muted-foreground leading-relaxed flex-1 mb-4">{r.description}</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {r.tags.map((t) => (
                    <span key={t} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{t}</span>
                  ))}
                </div>
                <Button asChild variant="outline" className="w-full">
                  <a href={introduceYourself(r.title)}>Introduce yourself</a>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-display font-bold mb-4">Don't see your role?</h2>
          <p className="text-muted-foreground mb-8">
            We're a small operation — if you think you can make the platform meaningfully better,
            tell us why.
          </p>
          <Button asChild variant="hero" size="lg">
            <a href={`mailto:careers@evenplayground.com`}>Email careers@evenplayground.com</a>
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            All roles also reachable at <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-primary">{CONTACT_EMAIL}</a>.
          </p>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default Careers;
