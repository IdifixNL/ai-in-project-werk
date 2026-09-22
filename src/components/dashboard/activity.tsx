import { actorName, type TicketEvent } from "@/lib/types";
import { timeAgo } from "@/components/ui";

const DOT: Record<TicketEvent["kind"], string> = {
  created: "var(--text-3)", status: "var(--cyan)", plan: "var(--purple-hi)", result: "var(--purple-hi)",
  comment: "var(--purple-hi)", refused: "var(--red)",
};

export function describe(e: TicketEvent): string {
  const to = e.toStatus?.replace("_", " ");
  switch (e.kind) {
    case "created": return `raised the ticket in ${to}`;
    case "status": return e.toStatus === "done" ? "approved and closed" : `moved to ${to}`;
    case "plan": return "published an AI plan";
    case "result": return `wrote the result${e.note ? ` (${e.note})` : ""}`;
    case "comment": return "commented";
    case "refused": return `tried to move to ${to}, refused by the server`;
  }
}

export function Activity({ events }: { events: (TicketEvent & { ref: string })[] }) {
  if (events.length === 0) return <p className="text-[11.5px] text-text-3">Nothing has happened yet.</p>;
  return (
    <div className="flex flex-col">
      {events.map((e) => (
        <div key={e.id} className="grid grid-cols-[18px_1fr_auto] items-start gap-2.5 border-t border-line py-2 text-[11.5px] first:border-t-0">
          <span className="ml-1 mt-[5px] h-2 w-2 rounded-full" style={{ background: DOT[e.kind] }} />
          <span className="text-text-2">
            <b className="font-semibold text-text">{actorName(e.actor)}</b> {describe(e)}{" "}
            <code className="font-mono text-[10.5px] text-text-3">{e.ref}</code>
          </span>
          <span className="whitespace-nowrap font-mono text-[10px] text-text-3">{timeAgo(e.createdAt)}</span>
        </div>
      ))}
    </div>
  );
}
