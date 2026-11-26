import { projectInfo } from "@/lib/agents";
export const dynamic = "force-static";
export function GET() {
  return Response.json(projectInfo(), { headers: { "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" } });
}
