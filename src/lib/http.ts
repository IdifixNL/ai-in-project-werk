import { KanbanError } from "./kanban";

/** Wraps a handler so domain errors become JSON with the right status. */
export async function handle(fn: () => Promise<unknown>, okStatus = 200): Promise<Response> {
  try {
    const data = await fn();
    return Response.json(data, { status: okStatus });
  } catch (err) {
    if (err instanceof KanbanError) return Response.json({ error: err.message }, { status: err.status });
    if (err instanceof SyntaxError) return Response.json({ error: "body must be valid JSON" }, { status: 400 });
    console.error(err);
    return Response.json({ error: "internal error" }, { status: 500 });
  }
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (!text) return {};
  const parsed = JSON.parse(text);
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) throw new SyntaxError("object expected");
  return parsed as Record<string, unknown>;
}
