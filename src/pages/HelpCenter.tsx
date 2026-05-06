import { useState } from "react";
import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { CONTACT_EMAIL } from "@/lib/contact";

const FAQS: { category: string; q: string; a: string }[] = [
  {
    category: "Getting started",
    q: "Who is Even Playground for?",
    a: "Athletes, institutions (clubs, schools, academies), parents, scouts, fans, and officials. Each group has a tailored experience once they sign up.",
  },
  {
    category: "Getting started",
    q: "How do I sign up?",
    a: "Hit \"Get Started\" on the homepage. You'll pick a role, then go through a short setup wizard for your sport, position, and (for athletes) any institution you want to link.",
  },
  {
    category: "Getting started",
    q: "Is the platform free?",
    a: "It's free for athletes today. Institutions and partners pay for advanced tooling — get in touch and we'll walk you through it.",
  },
  {
    category: "Athlete profile",
    q: "How do I edit my profile?",
    a: "Once logged in, head to your dashboard and pick \"Profile\" from the sidebar. You can update name, sport, height, weight, nationality, MYSAFA ID, current club, and more.",
  },
  {
    category: "Athlete profile",
    q: "What does \"verified\" mean?",
    a: "A verified stat is one that an institution or official has confirmed. Verified data shows up to scouts differently from self-logged data — it carries trust.",
  },
  {
    category: "Athlete profile",
    q: "Can I change my sport later?",
    a: "Yes. Profile settings let you update your primary sport at any time, and you can play across multiple if needed.",
  },
  {
    category: "Institutions",
    q: "How do I add my club's locations?",
    a: "From the institution dashboard, open the \"Locations\" tab. You can add multiple campuses, mark one as primary, and assign athletes/teams to specific locations.",
  },
  {
    category: "Institutions",
    q: "How do athletes link to my institution?",
    a: "During athlete signup, there's an optional step to search for and link an institution. You can also add or claim athletes directly from your roster page.",
  },
  {
    category: "Account & access",
    q: "I forgot my password.",
    a: "On the login page, click \"Forgot password\" and we'll email you a reset link. If it doesn't arrive within a few minutes, check your spam folder.",
  },
  {
    category: "Account & access",
    q: "How do I delete my account?",
    a: `Email us at ${CONTACT_EMAIL} from the address attached to your account. We'll confirm and remove your data within 14 days.`,
  },
  {
    category: "App & offline",
    q: "Can I install Even Playground as an app?",
    a: "Yes. On most browsers you'll see an \"Install\" button in the footer or address bar. The app works offline — pages you've already loaded stay available, and any actions you take while offline sync once you're back online.",
  },
  {
    category: "App & offline",
    q: "Why isn't my offline data syncing?",
    a: "First check your network. The app retries automatically when you reconnect. If it still doesn't sync, hit refresh — and if the problem persists, email us with a screenshot.",
  },
  {
    category: "Privacy & data",
    q: "Who can see my profile?",
    a: "Athletes control profile visibility. Verified institutions and scouts may have access to performance data — see our Privacy Policy for the full breakdown.",
  },
];

const CATEGORIES = Array.from(new Set(FAQS.map((f) => f.category)));

const HelpCenter = () => {
  const [query, setQuery] = useState("");
  const filtered = FAQS.filter(
    (f) => f.q.toLowerCase().includes(query.toLowerCase()) || f.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <MarketingLayout>
      <SEO
        title="Help Center | Even Playground"
        description="Answers to the most common questions about Even Playground — for athletes, institutions, parents, and partners."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              The fastest way to find an answer. Can't see what you're looking for? We're an email away.
            </p>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="pl-11 h-12"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container max-w-3xl">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">No matches for "{query}".</p>
              <Button asChild variant="hero"><Link to="/contact">Ask a human</Link></Button>
            </div>
          ) : (
            CATEGORIES.map((cat) => {
              const items = filtered.filter((f) => f.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="mb-10">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-primary mb-4">{cat}</h2>
                  <Accordion type="single" collapsible className="bg-card border border-border rounded-2xl divide-y divide-border">
                    {items.map((f) => (
                      <AccordionItem key={f.q} value={f.q} className="border-0 px-6">
                        <AccordionTrigger className="text-left font-display font-semibold">{f.q}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container text-center max-w-2xl">
          <h2 className="text-3xl font-display font-bold mb-4">Still stuck?</h2>
          <p className="text-muted-foreground mb-8">
            Real humans, real answers — usually within two working days.
          </p>
          <Button asChild variant="hero" size="lg"><Link to="/contact">Contact support</Link></Button>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default HelpCenter;
