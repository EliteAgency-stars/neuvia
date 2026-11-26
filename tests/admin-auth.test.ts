import { describe, expect, it, beforeEach, vi } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

describe("admin session tokens", () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD = "correct-horse-battery-staple";
    process.env.ADMIN_SESSION_SECRET = "s".repeat(48);
  });

  it("is disabled with weak configuration", async () => {
    process.env.ADMIN_PASSWORD = "short";
    const m = await import("@/lib/admin-auth");
    expect(m.adminConfigured()).toBe(false);
    expect(m.passwordMatches("short")).toBe(false);
  });

  it("verifies valid tokens and rejects tampered ones", async () => {
    const m = await import("@/lib/admin-auth");
    expect(m.passwordMatches("correct-horse-battery-staple")).toBe(true);
    expect(m.passwordMatches("wrong-password-here!!")).toBe(false);
    const t = m.createSessionToken();
    expect(m.verifySessionToken(t)).toBe(true);
    const [p, s] = t.split(".");
    expect(m.verifySessionToken(`${p}x.${s}`)).toBe(false);
    expect(m.verifySessionToken(`${p}.${s.slice(0, -2)}aa`)).toBe(false);
    process.env.ADMIN_SESSION_SECRET = "t".repeat(48);
    expect(m.verifySessionToken(t)).toBe(false);
  });
});
