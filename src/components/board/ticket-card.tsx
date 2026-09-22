"use client";

import type { Ticket } from "@/lib/types";
import { PriorityTag, LabelTag, Who, cn } from "@/components/ui";
import { ownerActor } from "@/lib/types";

export function TicketCard({ ticket, onOpen, onDragStart, dragging }: {
  ticket: Ticket; onOpen: () => void; onDragStart: () => void; dragging: boolean;
}) {
  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; onDragStart(); }}
      onClick={onOpen}
      className={cn(
        "relative flex w-full cursor-grab flex-col gap-1.5 rounded-md border border-line bg-card px-[11px] pb-2 pt-2.5 text-left transition-colors hover:border-line-hi hover:bg-card-hi active:cursor-grabbing",
        dragging && "opacity-40",
        ticket.status === "done" && "opacity-70",
      )}
    >
      {ticket.status === "review" && (
        <span className="absolute right-2.5 top-2.5 h-[7px] w-[7px] rounded-full bg-yellow shadow-[0_0_8px_var(--yellow)]" title="waiting for review" />
      )}
      <span className="font-mono text-[10.5px] text-text-3">{ticket.ref}</span>
      <span className="text-[12.5px] font-semibold leading-[1.35]">{ticket.title}</span>
      <span className="flex flex-wrap items-center gap-1.5">
        <PriorityTag priority={ticket.priority} />
        <LabelTag label={ticket.label} />
        <span className="ml-auto">
          {ticket.owner ? <Who actor={ownerActor(ticket.owner)} /> : null}
        </span>
      </span>
    </button>
  );
}
