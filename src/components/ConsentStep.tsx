import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ConsentStepProps {
  role: "athlete" | "institution" | "fan";
  onConsent: (consented: boolean) => void;
}

const ConsentStep = ({ role, onConsent }: ConsentStepProps) => {
  const [dataConsent, setDataConsent] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);

  const requiresGuardian = role === "fan";

  const allConsented = dataConsent && termsConsent && (requiresGuardian ? guardianConsent : true);

  const handleChange = (field: "data" | "guardian" | "terms", val: boolean) => {
    const next = {
      data: field === "data" ? val : dataConsent,
      guardian: field === "guardian" ? val : guardianConsent,
      terms: field === "terms" ? val : termsConsent,
    };
    const ok = next.data && next.terms && (requiresGuardian ? next.guardian : true);
    if (field === "data") setDataConsent(val);
    if (field === "guardian") setGuardianConsent(val);
    if (field === "terms") setTermsConsent(val);
    onConsent(ok);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground">Privacy & Consent</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Even Playground is committed to protecting your personal information in compliance with POPIA (Protection of Personal Information Act, South Africa).
        </p>
      </div>

      <div className="space-y-4 bg-muted/30 rounded-xl border border-border p-5">
        {/* Data Processing Consent */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="data-consent"
            checked={dataConsent}
            onCheckedChange={(v) => handleChange("data", !!v)}
            className="mt-0.5"
          />
          <Label htmlFor="data-consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
            I consent to Even Playground collecting, storing, and processing my personal data (name, contact info, sports performance data) for the purposes of athlete profiling, scouting, and community features as described in the Privacy Policy.
          </Label>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="terms-consent"
            checked={termsConsent}
            onCheckedChange={(v) => handleChange("terms", !!v)}
            className="mt-0.5"
          />
          <Label htmlFor="terms-consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
            I have read and agree to the{" "}
            <span className="text-primary font-semibold underline cursor-pointer">Terms of Service</span> and{" "}
            <span className="text-primary font-semibold underline cursor-pointer">Privacy Policy</span>.
          </Label>
        </div>

        {/* Guardian consent (parents only) */}
        {requiresGuardian && (
          <div className="flex items-start gap-3 border-t border-border pt-4">
            <Checkbox
              id="guardian-consent"
              checked={guardianConsent}
              onCheckedChange={(v) => handleChange("guardian", !!v)}
              className="mt-0.5"
            />
            <Label htmlFor="guardian-consent" className="text-sm text-foreground leading-relaxed cursor-pointer">
              I confirm that I am the legal parent or guardian of any child athlete profiles I create on this platform, and I consent on their behalf in accordance with POPIA regulations.
            </Label>
          </div>
        )}
      </div>

      {allConsented && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-sm text-stat-green bg-stat-green/10 px-4 py-2.5 rounded-xl border border-stat-green/20"
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          All consents given. You're ready to complete setup!
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground/60 text-center">
        POPIA v1.0 · Data collected as of {new Date().toLocaleDateString("en-ZA")}
      </p>
    </motion.div>
  );
};

export default ConsentStep;
