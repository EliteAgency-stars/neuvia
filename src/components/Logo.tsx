type MarkProps = { className?: string; title?: string; tone?: "color" | "mono" | "inverse" };

/**
 * NEUVIA isotype — two intelligences (nodes) joined by a bidirectional,
 * self-regulating loop with a synapse at its centre.
 */
export function LogoMark({ className, title, tone = "color" }: MarkProps) {
  const ink = tone === "inverse" ? "#FFFFFF" : "#0B1714";
  const accent = tone === "mono" ? ink : tone === "inverse" ? "#2BF0B4" : "#00C896";
  return (
    <svg viewBox="0 0 32 32" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      <g transform="rotate(-32 16 16)">
      <path d="M8.5 16C11.2 7.6 20.8 7.6 23.5 16" fill="none" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M23.5 16C20.8 24.4 11.2 24.4 8.5 16" fill="none" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="8.5" cy="16" r="3" fill={ink} />
      <circle cx="23.5" cy="16" r="3" fill={accent} />
      <circle cx="16" cy="16" r="1.7" fill="none" stroke={accent} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/** Font-independent monoline wordmark drawn as paths. */
export function Wordmark({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="-1.5 -1.5 101 23" className={className} aria-hidden>
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinejoin="miter" strokeLinecap="butt">
        <path d="M0 20V0L14 20V0" />
        <path d="M32 0H20V20H32M20 10H30" />
        <path d="M38 0V12.5a7 7 0 0 0 14 0V0" />
        <path d="M58 0L65 20L72 0" />
        <path d="M78 0V20" />
        <path d="M84 20L91 0L98 20M86.8 12.5H95.2" />
      </g>
    </svg>
  );
}

export function Logo({ className = "", inverse = false }: { className?: string; inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-7" tone={inverse ? "inverse" : "color"} />
      <Wordmark className="h-[13px] w-auto" color={inverse ? "#FFFFFF" : "#0B1714"} />
      <span className="sr-only">NEUVIA</span>
    </span>
  );
}
