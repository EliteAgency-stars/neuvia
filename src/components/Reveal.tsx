import type { ReactNode, CSSProperties } from "react";

/**
 * Scroll reveal via CSS scroll-driven animations (progressive enhancement).
 * No JavaScript: content is always visible to crawlers, no-JS visitors and
 * browsers without `animation-timeline` support.
 */
export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "li" | "section" }) {
  const style = delay ? ({ "--reveal-delay": `${delay * 100}%` } as CSSProperties) : undefined;
  return <Tag className={`reveal ${className}`} style={style}>{children}</Tag>;
}
