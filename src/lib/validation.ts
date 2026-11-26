import { z } from "zod";

export const ORG_TYPES = ["ai_lab", "model_developer", "enterprise", "startup", "academic", "public_sector", "investor", "independent", "other"] as const;
export const INTERESTS = ["early_access", "research_collaboration", "enterprise_integration", "model_evaluation", "technical_partnership", "academic_collaboration", "investment", "developer_access", "general"] as const;
export const STATUSES = ["new", "under_review", "contacted", "in_discussion", "closed"] as const;
export type Status = (typeof STATUSES)[number];

/** Strip control characters (except newline/tab) and normalize whitespace. */
export const clean = (s: string) => s.normalize("NFKC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, "").trim();

const text = (min: number, max: number) => z.string().transform(clean).pipe(z.string().min(min).max(max));
const optionalText = (max: number) => z.string().optional().default("").transform(clean).pipe(z.string().max(max));

export const accessRequestSchema = z.object({
  fullName: text(2, 120),
  email: z.string().transform((s) => clean(s).toLowerCase()).pipe(z.email().max(254)),
  organization: text(1, 160),
  role: text(1, 120),
  country: optionalText(80),
  orgType: z.enum(ORG_TYPES),
  interest: z.enum(INTERESTS),
  infrastructure: optionalText(300),
  problem: text(20, 4000),
  message: optionalText(4000),
  privacyAccepted: z.literal(true),
  newsletter: z.boolean().optional().default(false),
  locale: z.enum(["en", "es", "de"]).optional().default("en"),
  // anti-abuse fields
  website: z.string().max(0).optional().default(""), // honeypot: must stay empty
  startedAt: z.number().int().positive(),
  idempotencyKey: z.string().uuid(),
});

export type AccessRequestInput = z.input<typeof accessRequestSchema>;
export type AccessRequest = z.output<typeof accessRequestSchema>;

/** Heuristic: flag obvious secrets so we can refuse them instead of storing them. */
export function looksLikeSecret(s: string) {
  return /(sk-[A-Za-z0-9_-]{16,}|sk-ant-[A-Za-z0-9_-]{10,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.)/.test(s);
}
