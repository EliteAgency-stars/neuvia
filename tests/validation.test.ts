import { describe, expect, it } from "vitest";
import { accessRequestSchema, clean, looksLikeSecret } from "@/lib/validation";

const valid = {
  fullName: "Ada Lovelace",
  email: "  Ada@Example.org ",
  organization: "Analytical Engines",
  role: "Research lead",
  orgType: "ai_lab",
  interest: "research_collaboration",
  problem: "We need to measure contextual drift in long-running agents.",
  privacyAccepted: true,
  startedAt: Date.now() - 10_000,
  idempotencyKey: "3f0e3c2a-6c1b-4a8e-9f5d-2b7c8d9e0f1a",
};

describe("early access validation", () => {
  it("accepts a valid request and normalizes email", () => {
    const r = accessRequestSchema.parse(valid);
    expect(r.email).toBe("ada@example.org");
    expect(r.newsletter).toBe(false);
  });
  it("requires explicit privacy acceptance", () => {
    expect(accessRequestSchema.safeParse({ ...valid, privacyAccepted: false }).success).toBe(false);
  });
  it("rejects filled honeypot", () => {
    expect(accessRequestSchema.safeParse({ ...valid, website: "http://spam" }).success).toBe(false);
  });
  it("rejects unknown enum values and short problems", () => {
    expect(accessRequestSchema.safeParse({ ...valid, interest: "hack" }).success).toBe(false);
    expect(accessRequestSchema.safeParse({ ...valid, problem: "short" }).success).toBe(false);
  });
  it("rejects invalid emails and oversize fields", () => {
    expect(accessRequestSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
    expect(accessRequestSchema.safeParse({ ...valid, fullName: "x".repeat(500) }).success).toBe(false);
  });
  it("strips control and bidi characters", () => {
    expect(clean("  a\u0000b‮c​ ")).toBe("abc");
  });
  it("detects likely secrets", () => {
    expect(looksLikeSecret("my key is sk-ant-abcdefghijklmnop123")).toBe(true);
    expect(looksLikeSecret("AKIAABCDEFGHIJKLMNOP")).toBe(true);
    expect(looksLikeSecret("We use an open-weight model with retrieval.")).toBe(false);
  });
});
