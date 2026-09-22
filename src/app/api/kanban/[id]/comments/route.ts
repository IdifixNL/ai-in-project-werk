import { listComments, addComment, resolveId } from "@/lib/kanban";
import { handle, body } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/kanban/{id}/comments  ->  Comment[] */
export async function GET(_req: Request, { params }: Ctx) {
  return handle(async () => listComments(await resolveId((await params).id)));
}

/** POST /api/kanban/{id}/comments  {author, content}  ->  Comment */
export async function POST(req: Request, { params }: Ctx) {
  return handle(async () => {
    const b = await body(req);
    return addComment(await resolveId((await params).id), { author: b.author, content: b.content });
  }, 201);
}
