import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, Trophy, Users, Globe } from "lucide-react";
import { buildMailto, submitToSupabase } from "@/lib/contact";

const SPONSOR_TYPES = ["Brand sponsor", "Equipment partner", "Tournament partner", "Academy / club", "Media partner", "Other"];
const BUDGET_RANGES = ["Under R50,000", "R50,000 – R250,000", "R250,000 – R1,000,000", "R1,000,000+", "Prefer to discuss"];

const REASONS = [
  { icon: Users, title: "Reach athletes early", text: "Connect with verified athletes and institutions before they hit the global stage." },
  { icon: Trophy, title: "Verified, not vanity", text: "Every athlete on the platform has institution-backed performance data — no inflated numbers." },
  { icon: Globe, title: "Global, grassroots-up", text: "From Soweto to São Paulo — partnerships that mean something off the headline circuit." },
];

const BecomeASponsor = () => {
  const [org, setOrg] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitToSupabase({
        submission_type: "sponsor",
        name: contactName,
        email,
        message,
        organization: org,
        sponsor_type: type || null,
        budget_range: budget || null,
      });
      setStatus("success");
    } catch {
      const body = [
        "Sponsorship enquiry",
        "------------------",
        `Organization: ${org}`,
        `Contact: ${contactName}`,
        `Email: ${email}`,
        `Sponsorship type: ${type || "(not specified)"}`,
        `Budget range: ${budget || "(not specified)"}`,
        "",
        "Message:",
        message,
      ].join("\n");
      window.location.href = buildMailto(
        `Sponsorship enquiry — ${org || contactName}`,
        body,
        "sponsors@evenplayground.com"
      );
      setStatus("idle");
    }
  };

  return (
    <MarketingLayout>
      <SEO
        title="Become a Sponsor | Even Playground"
        description="Partner with the platform powering verified sports data for athletes everywhere. Talk to us about sponsorship, tournaments, and brand partnerships."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Sponsor the <span className="text-primary">next generation</span>.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Even Playground sits underneath the careers of athletes the rest of the world hasn't met yet.
              If you're early enough to back them now, this is where to start.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {REASONS.map((r) => (
              <div key={r.title} className="p-8 rounded-2xl bg-card border border-border shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <r.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-3">{r.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container max-w-3xl">
          {status === "success" ? (
            <div className="p-12 rounded-2xl bg-card border border-border shadow-sm text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display font-bold text-2xl mb-3">Enquiry received.</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Thanks{org ? `, ${org}` : ""} — we'll be in touch at {email} within two working days.
              </p>
            </div>
          ) : (
          <>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Tell us about your organization</h2>
            <p className="text-muted-foreground">
              We'll get back within two working days. If something goes wrong on our side, your mail client opens as a fallback.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-card border border-border shadow-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsor-org">Organization</Label>
                <Input id="sponsor-org" required value={org} onChange={(e) => setOrg(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sponsor-contact">Your name</Label>
                <Input id="sponsor-contact" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="sponsor-email">Email</Label>
              <Input id="sponsor-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sponsor-type">Sponsorship type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger id="sponsor-type"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {SPONSOR_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sponsor-budget">Budget range</Label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger id="sponsor-budget"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {BUDGET_RANGES.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="sponsor-message">Tell us a bit more</Label>
              <Textarea id="sponsor-message" required rows={5} value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="What kind of partnership are you imagining? Are there athletes, sports, or regions you're focused on?" />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send sponsorship enquiry"}
            </Button>
            <p className="text-xs text-muted-foreground flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              We never share enquiry details outside the partnerships team.
            </p>
          </form>
          </>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
};

export default BecomeASponsor;
