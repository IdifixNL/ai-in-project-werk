import { getStats } from "@/lib/kanban";
import { handle } from "@/lib/http";

/** GET /api/stats  ->  everything the dashboard shows */
export async function GET() {
  return handle(() => getStats());
}
