import { getTicket, updateTicket, resolveId, type PatchInput } from "@/lib/kanban";
import { handle, body } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/kanban/{id or ref}  ->  Ticket */
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => getTicket(await resolveId((await params).id)));
}

/**
 * PATCH /api/kanban/{id or ref}
 * {actor, status?, priority?, label?, owner?, title?, description?, plan?, outcome?, evidence?, appendEvidence?, note?}
 * 403 when an agent tries status: done.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  return handle(async () => updateTicket(await resolveId((await params).id), (await body(req)) as PatchInput));
}
