import { MarketingLayout } from "@/components/MarketingLayout";
import { SEO } from "@/components/SEO";
import { CONTACT_EMAIL } from "@/lib/contact";

const SECTIONS = [
  {
    title: "1. Agreement",
    body: (
      <p>
        These Terms of Use ("Terms") govern your access to and use of the Even Playground platform at
        evenplayground.com (the "Platform"). By creating an account or otherwise using the Platform, you agree
        to these Terms. If you don't agree, don't use the Platform.
      </p>
    ),
  },
  {
    title: "2. Eligibility",
    body: (
      <p>
        You must be 13 or older to use the Platform. Athletes under 18 require parent or guardian consent and
        oversight via the parent dashboard. Institutions warrant they have authority to act on behalf of the
        organisation they represent.
      </p>
    ),
  },
  {
    title: "3. Your account",
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Provide accurate information when registering and keep it up to date.</li>
        <li>Keep your credentials secure — you're responsible for activity under your account.</li>
        <li>Notify us at <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a> if you suspect unauthorised access.</li>
      </ul>
    ),
  },
  {
    title: "4. Content you submit",
    body: (
      <div className="space-y-3">
        <p>
          You retain ownership of profile information, statistics, highlights, and other content you upload
          ("Content"). By submitting Content you grant Even Playground a worldwide, non-exclusive,
          royalty-free licence to host, display, and process the Content for the purpose of operating the
          Platform.
        </p>
        <p>You're responsible for ensuring your Content doesn't infringe anyone's rights or break any law.</p>
      </div>
    ),
  },
  {
    title: "5. Verified data",
    body: (
      <p>
        Stats, match results, and achievements may be marked as "verified" once an authorised institution or
        official confirms them. Submitting fraudulent verifications or attempting to manipulate the
        verification process may result in immediate account termination.
      </p>
    ),
  },
  {
    title: "6. Acceptable use",
    body: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Don't impersonate another person or institution.</li>
        <li>Don't harass, bully, or threaten other users.</li>
        <li>Don't upload malicious code or attempt to disrupt the Platform.</li>
        <li>Don't scrape or automate access without our written permission.</li>
        <li>Don't use the Platform for any unlawful purpose.</li>
      </ul>
    ),
  },
  {
    title: "7. Suspension and termination",
    body: (
      <p>
        We may suspend or terminate accounts that breach these Terms, with or without notice depending on the
        severity. You can close your account at any time by emailing{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
  {
    title: "8. Service availability",
    body: (
      <p>
        We work hard to keep the Platform available and accurate, but we provide it on an "as is" and "as
        available" basis. We don't guarantee uninterrupted access, error-free operation, or that data will
        always be complete.
      </p>
    ),
  },
  {
    title: "9. Limitation of liability",
    body: (
      <p>
        To the fullest extent permitted by law, Even Playground is not liable for indirect, incidental, or
        consequential damages arising from your use of the Platform. Our total liability is limited to the
        amount you paid us in the 12 months preceding the event giving rise to the claim, or ZAR 1,000 if
        you haven't paid anything — whichever is greater.
      </p>
    ),
  },
  {
    title: "10. Changes to these Terms",
    body: (
      <p>
        We may update these Terms from time to time. Material changes will be communicated in-app or by email.
        Continued use after the effective date constitutes acceptance.
      </p>
    ),
  },
  {
    title: "11. Governing law",
    body: (
      <p>
        These Terms are governed by the laws of the Republic of South Africa. Disputes will be handled by the
        courts of Johannesburg, South Africa, unless local consumer protection law in your jurisdiction
        requires otherwise.
      </p>
    ),
  },
  {
    title: "12. Contact",
    body: (
      <p>
        Questions about these Terms — <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary hover:underline">{CONTACT_EMAIL}</a>.
      </p>
    ),
  },
];

const TermsOfUse = () => {
  return (
    <MarketingLayout>
      <SEO
        title="Terms of Use | Even Playground"
        description="The terms governing how you use the Even Playground platform."
      />

      <section className="py-20 md:py-28 bg-card border-b border-border">
        <div className="container max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wider text-primary mb-4">Legal</p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Terms of Use</h1>
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

export default TermsOfUse;
