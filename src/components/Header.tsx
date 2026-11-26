"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Globe } from "lucide-react";
import { Logo } from "./Logo";
import { locales, localeNames, localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

type Props = { locale: Locale; t: Dictionary["nav"] };

const NAV = [
  ["technology", "/technology"],
  ["research", "/research"],
  ["solutions", "/solutions"],
  ["benchmarks", "/benchmarks"],
  ["developers", "/developers"],
  ["about", "/about"],
] as const;

function stripLocale(pathname: string) {
  const parts = pathname.split("/");
  if (parts[1] === "es" || parts[1] === "de") return "/" + parts.slice(2).join("/");
  return pathname || "/";
}

export function Header({ locale, t }: Props) {
  const pathname = usePathname() || "/";
  const base = stripLocale(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => { setOpen(false); setLangOpen(false); }, [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setLangOpen(false); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const href = (p: string) => localePath(locale, p);
  const isActive = (p: string) => base === p || base.startsWith(p + "/");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">
        {t.skip}
      </a>
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
        <div
          className={`glass mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 pl-4 pr-2 transition-[box-shadow,background] duration-500 ${scrolled ? "" : "shadow-none"}`}
          style={{ borderRadius: 999 }}
        >
          <Link href={href("/")} className="shrink-0 rounded-full" aria-label="NEUVIA — home">
            <Logo />
          </Link>

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              {NAV.map(([key, path]) => (
                <li key={key}>
                  <Link
                    href={href(path)}
                    aria-current={isActive(path) ? "page" : undefined}
                    className={`rounded-full px-3.5 py-2 text-[0.875rem] font-medium transition-colors ${
                      isActive(path) ? "bg-ink/[0.06] text-ink" : "text-ink/70 hover:bg-ink/[0.04] hover:text-ink"
                    }`}
                  >
                    {t[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-1.5">
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setLangOpen((v) => !v)}
                aria-expanded={langOpen}
                aria-haspopup="true"
                aria-label={t.language}
                className="flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.8125rem] font-medium text-ink/70 transition-colors hover:bg-ink/[0.05] hover:text-ink"
              >
                <Globe className="h-4 w-4" aria-hidden />
                {locale.toUpperCase()}
              </button>
              {langOpen && (
                <ul className="glass absolute right-0 top-12 min-w-36 p-1.5" role="menu">
                  {locales.map((l) => (
                    <li key={l} role="none">
                      <Link
                        role="menuitem"
                        href={localePath(l, base)}
                        hrefLang={l}
                        lang={l}
                        className={`block rounded-xl px-3 py-2 text-sm ${l === locale ? "bg-mint-soft font-semibold text-jade-deep" : "text-ink/80 hover:bg-ink/[0.04]"}`}
                      >
                        {localeNames[l]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <Link href={href("/early-access")} className="btn btn-primary hidden !h-10 !px-4 !text-[0.875rem] sm:inline-flex">
              {t.earlyAccess}
            </Link>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/[0.05] lg:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t.close : t.menu}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div id="mobile-nav" className="glass animate-rise mx-auto mt-2 max-w-6xl p-3 lg:hidden">
            <nav aria-label="Mobile">
              <ul className="grid gap-0.5">
                {[...NAV, ["aiAgents", "/ai-agents"] as const, ["contact", "/contact"] as const].map(([key, path]) => (
                  <li key={key}>
                    <Link href={href(path)} className="flex items-center justify-between rounded-2xl px-4 py-3 text-[1.0625rem] font-medium text-ink hover:bg-ink/[0.04]">
                      {t[key]}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line px-1 pt-3">
              <div className="flex gap-1">
                {locales.map((l) => (
                  <Link key={l} href={localePath(l, base)} hrefLang={l} className={`rounded-full px-3 py-1.5 text-sm ${l === locale ? "bg-ink text-white" : "text-ink/70"}`}>
                    {l.toUpperCase()}
                  </Link>
                ))}
              </div>
              <Link href={href("/early-access")} className="btn btn-primary !h-10">
                {t.earlyAccess}
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
