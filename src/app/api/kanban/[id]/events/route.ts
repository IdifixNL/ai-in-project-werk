import { listEvents, resolveId } from "@/lib/kanban";
import { handle } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/kanban/{id}/events  ->  TicketEvent[] oldest first */
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => listEvents(await resolveId((await params).id)));
}
