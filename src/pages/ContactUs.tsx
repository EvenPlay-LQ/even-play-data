import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Mail, MapPin, MessageSquare } from "lucide-react";
import { CONTACT_EMAIL, buildMailto, submitToSupabase } from "@/lib/contact";

const ContactUs = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      await submitToSupabase({
        submission_type: "contact",
        name,
        email,
        subject: subject || null,
        message,
      });
      setStatus("success");
    } catch {
      // Network or RLS failure — fall back to opening the user's mail client.
      const body = [`Name: ${name}`, `Email: ${email}`, "", message].join("\n");
      window.location.href = buildMailto(subject || "Contact form", body);
      setStatus("idle");
    }
  };

  return (
    <MarketingLayout>
      <SEO
        title="Contact | Even Playground"
        description="Reach the Even Playground team — questions, feedback, partnerships, or just to say hello."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border text-center">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6">
              Talk to us.
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Athletes, clubs, sponsors, journalists, investors — whatever the question, the inbox is open.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1 space-y-8">
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Email</h3>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-muted-foreground hover:text-primary transition-colors">
                {CONTACT_EMAIL}
              </a>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Response time</h3>
              <p className="text-muted-foreground">Usually within 2 working days.</p>
            </div>
            <div>
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">Based in</h3>
              <p className="text-muted-foreground">Johannesburg, South Africa — building for the world.</p>
            </div>
          </div>

          <div className="md:col-span-2">
            {status === "success" ? (
              <div className="p-12 rounded-2xl bg-card border border-border shadow-sm text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-3">Message received.</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Thanks {name.split(" ")[0] || "for reaching out"} — we'll come back to {email} within two working days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 p-8 rounded-2xl bg-card border border-border shadow-sm">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Your name</Label>
                    <Input id="contact-name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input id="contact-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input id="contact-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="What's this about?" />
                </div>
                <div>
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea id="contact-message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    We'll reply within two working days. If something goes wrong, your email client opens as a fallback.
                  </p>
                  <Button type="submit" variant="hero" size="lg" disabled={status === "submitting"}>
                    {status === "submitting" ? "Sending..." : "Send message"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default ContactUs;
