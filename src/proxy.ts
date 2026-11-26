import { NextResponse, type NextRequest } from "next/server";

const PREFIXED = new Set(["es", "de"]);

/**
 * Locale routing:
 *  - English (default) lives at the root: /technology  → internally /en/technology
 *  - Spanish and German are prefixed: /es/technology, /de/technology
 *  - /en/* is redirected to the unprefixed URL in next.config redirects.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const first = pathname.split("/")[1];
  if (first && (PREFIXED.has(first) || first === "en")) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api|admin|md|_next|\\.well-known|llms\\.txt|llms-full\\.txt|neuvia\\.md|humans\\.txt|robots\\.txt|sitemap\\.xml|favicon\\.ico|icon|apple-icon|opengraph-image|brand|team|.*\\.[a-zA-Z0-9]+$).*)",
  ],
};
