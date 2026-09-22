import { listTickets, createTicket, type CreateInput } from "@/lib/kanban";
import { handle, body } from "@/lib/http";

/** GET /api/kanban  ->  Ticket[] */
export async function GET() {
  return handle(() => listTickets());
}

/** POST /api/kanban  {title, description?, status?, priority?, label?, owner?, actor}  ->  Ticket */
export async function POST(req: Request) {
  return handle(async () => createTicket((await body(req)) as CreateInput), 201);
}
