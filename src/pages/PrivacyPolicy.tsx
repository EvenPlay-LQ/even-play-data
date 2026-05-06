import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { CONTACT_EMAIL } from "@/lib/contact";

const SECTIONS = [
  {
    title: "1. Who we are",
    body: (
      <p>
        Even Playground operates the platform at evenplayground.com (the "Platform"). When this policy says
        "we", "us", or "our", it means Even Playground. Questions about this policy can be sent to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
  {
    title: "2. The data we collect",
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Account data</strong> — name, email, role (athlete, institution, parent, scout, official), authentication identifiers from Supabase.</li>
        <li><strong>Profile data</strong> — sport, position, height, weight, nationality, MYSAFA / federation IDs, current club, club history, photo.</li>
        <li><strong>Performance data</strong> — match logs, statistics, achievements, highlights, attendance records, verifications submitted by institutions or officials.</li>
        <li><strong>Institution data</strong> — for institutions, organisation details, locations / campuses, rosters, fixtures, attendance and compliance documents.</li>
        <li><strong>Device & usage data</strong> — IP address, browser type, pages visited, basic interaction logs used to keep the service stable and secure.</li>
      </ul>
    ),
  },
  {
    title: "3. How we use it",
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>To run the Platform — accounts, profiles, dashboards, performance pipelines.</li>
        <li>To verify athlete data through institutions and officials.</li>
        <li>To make discovery work — surfacing athletes to institutions and partners that match their profile.</li>
        <li>To send transactional email (sign-up, password reset, security alerts).</li>
        <li>To improve the Platform — error monitoring, analytics, product decisions.</li>
        <li>To meet legal and safeguarding obligations.</li>
      </ul>
    ),
  },
  {
    title: "4. Who sees your data",
    body: (
      <div className="space-y-3">
        <p><strong>Other users:</strong> athletes' public profiles are visible to logged-in users; verified institutions can see athletes that link to them; scouts may see profiles athletes choose to make discoverable.</p>
        <p><strong>Service providers:</strong> Supabase (database, auth), our hosting provider (Hostinger), email delivery, error monitoring. Each is bound by data-processing terms.</p>
        <p><strong>Legal requirements:</strong> we may disclose data when required by law, court order, or to protect rights and safety.</p>
        <p><strong>We do not sell your data.</strong></p>
      </div>
    ),
  },
  {
    title: "5. How long we keep it",
    body: (
      <p>
        We keep account and profile data for as long as the account is active. Performance and verification
        records linked to your account are retained for the same period unless you ask us to delete them.
        Backups are rotated on a regular schedule.
      </p>
    ),
  },
  {
    title: "6. Your rights",
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Access — ask for a copy of your data.</li>
        <li>Correction — fix anything inaccurate.</li>
        <li>Deletion — close your account and remove your data.</li>
        <li>Portability — export your profile and performance data.</li>
        <li>Object / restrict — limit how we use your data for non-essential purposes.</li>
        <li>Complain — to the South African Information Regulator (or your local DPA) if we get this wrong.</li>
      </ul>
    ),
  },
  {
    title: "7. Children",
    body: (
      <p>
        Athletes under 18 require a parent or guardian to consent to their account, and a parent dashboard is
        available to oversee activity. We do not knowingly collect data from children outside of this
        guardian-consent flow.
      </p>
    ),
  },
  {
    title: "8. Cookies",
    body: (
      <p>
        We use cookies and similar storage to keep you logged in, remember preferences, and measure usage. You
        can clear them in your browser at any time — some functionality (such as staying logged in) depends
        on them.
      </p>
    ),
  },
  {
    title: "9. Changes",
    body: (
      <p>
        If we change this policy materially, we'll notify you in-app or by email and update the "last updated"
        date below.
      </p>
    ),
  },
  {
    title: "10. Contact",
    body: (
      <p>
        Questions, requests, or complaints — <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  return (
    <MarketingLayout>
      <SEO
        title="Privacy Policy | Even Playground"
        description="How Even Playground collects, uses, and protects your data."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: 6 May 2026</p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            {SECTIONS.map((s) => (
              <section key={s.title}>
                <h2 className="text-2xl font-display font-bold mb-4">{s.title}</h2>
                <div className="text-muted-foreground leading-relaxed space-y-4">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
};

export default PrivacyPolicy;
