import { describe, expect, it, vi, afterEach } from "vitest";

vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));

describe("admin allowlist", () => {
  afterEach(() => { delete process.env.ADMIN_EMAILS; });

  it("defaults to the founder account only", async () => {
    const m = await import("@/lib/admin-auth");
    expect(m.isAllowedAdmin("founder@proyectumia.com")).toBe(true);
    expect(m.isAllowedAdmin("FOUNDER@ProyectumIA.com")).toBe(true);
    expect(m.isAllowedAdmin("someone@example.com")).toBe(false);
    expect(m.isAllowedAdmin(undefined)).toBe(false);
  });

  it("supports a configurable comma-separated list", async () => {
    process.env.ADMIN_EMAILS = "a@neuvia.co, b@neuvia.co";
    const m = await import("@/lib/admin-auth");
    expect(m.isAllowedAdmin("b@neuvia.co")).toBe(true);
    expect(m.isAllowedAdmin("founder@proyectumia.com")).toBe(false);
  });

  it("issues hardened cookies", async () => {
    const m = await import("@/lib/admin-auth");
    const c = m.authCookie(m.AT, "x", 60);
    expect(c).toMatchObject({ httpOnly: true, secure: true, sameSite: "strict", path: "/" });
    expect(m.AT.startsWith("__Host-")).toBe(true);
  });
});
