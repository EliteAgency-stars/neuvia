import { neuviaMd } from "@/lib/agents";
export const dynamic = "force-static";
export function GET() {
  return new Response(neuviaMd(), { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}
