import { supabase } from "@/integrations/supabase/client";

/** Contact email used across marketing pages — keep in one place. */
export const CONTACT_EMAIL = "info@evenplayground.com";

/** Build a mailto: URL with optional subject + body. */
export const buildMailto = (subject: string, body: string, to = CONTACT_EMAIL) => {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  // URLSearchParams encodes spaces as "+", but mailto wants %20.
  const qs = params.toString().replace(/\+/g, "%20");
  return `mailto:${to}?${qs}`;
};

export type SubmissionType = "contact" | "sponsor" | "careers";

export interface SubmissionPayload {
  submission_type: SubmissionType;
  name: string;
  email: string;
  message: string;
  subject?: string | null;
  organization?: string | null;
  sponsor_type?: string | null;
  budget_range?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Insert a public form submission into Supabase. Throws on failure so the
 * caller can fall back to mailto.
 */
export const submitToSupabase = async (payload: SubmissionPayload) => {
  const { error } = await supabase.from("contact_submissions").insert({
    submission_type: payload.submission_type,
    name: payload.name,
    email: payload.email,
    message: payload.message,
    subject: payload.subject ?? null,
    organization: payload.organization ?? null,
    sponsor_type: payload.sponsor_type ?? null,
    budget_range: payload.budget_range ?? null,
    metadata: (payload.metadata ?? {}) as never,
  });
  if (error) throw error;
};
