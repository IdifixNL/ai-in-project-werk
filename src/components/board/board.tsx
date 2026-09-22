"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { COLUMNS, PRIORITIES, type Priority, type Status, type Ticket } from "@/lib/types";
import { api } from "@/lib/client-api";
import { useIdentity, humanActor } from "@/lib/identity";
import { cn } from "@/components/ui";
import { TicketCard } from "./ticket-card";
import { TicketDialog } from "./ticket-dialog";
import { NewTicketDialog } from "./new-ticket-dialog";

const COLUMN_COLOUR: Record<Status, string> = {
  backlog: "var(--text-3)", todo: "var(--blue)", in_progress: "var(--cyan)", review: "var(--yellow)", done: "var(--green)",
};

export function Board() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [label, setLabel] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<Status | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState<Status | null>(null);
  const [showOldDone, setShowOldDone] = useState(false);
  const [name] = useIdentity();
  const actor = humanActor(name);

  const refresh = useCallback(async () => {
    try {
      setTickets(await api<Ticket[]>("/api/kanban"));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    // Agents write through the API from outside the browser, so poll to pick up their moves.
    const first = setTimeout(refresh, 0);
    const t = setInterval(refresh, 5000);
    return () => { clearTimeout(first); clearInterval(t); };
  }, [refresh]);

  const labels = useMemo(() => Array.from(new Set(tickets.map((t) => t.label).filter((l): l is string => !!l))).sort(), [tickets]);

  const visible = tickets.filter((t) => (priority === "all" || t.priority === priority) && (label === null || t.label === label));

  // Done fills up fast; keep the column readable by folding away anything older than two weeks.
  const recentCutoff = Date.now() - 14 * 86_400_000;
  const isRecentDone = (t: Ticket) => t.status !== "done" || new Date(t.updatedAt).getTime() >= recentCutoff;
  const oldDoneCount = visible.filter((t) => !isRecentDone(t)).length;

  async function move(id: string, status: Status) {
    const t = tickets.find((x) => x.id === id);
    if (!t || t.status === status) return;
    setTickets((all) => all.map((x) => (x.id === id ? { ...x, status } : x)));
    try {
      await api(`/api/kanban/${id}`, { method: "PATCH", body: { status, actor } });
    } catch (e) {
      setError((e as Error).message);
    }
    refresh();
  }

  const open = openId ? tickets.find((t) => t.id === openId) ?? null : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Chip on={priority === "all"} onClick={() => setPriority("all")}>All</Chip>
        {PRIORITIES.slice().reverse().map((p) => (
          <Chip key={p} on={priority === p} onClick={() => setPriority(p)}>{p}</Chip>
        ))}
        {labels.length > 0 && <span className="mx-1 h-[18px] w-px bg-line-hi" />}
        {labels.map((l) => (
          <Chip key={l} on={label === l} onClick={() => setLabel(label === l ? null : l)}>{l}</Chip>
        ))}
        <div className="flex-1" />
        {error && <span className="text-[11.5px] text-tone-urgent-fg" style={{ color: "var(--tone-urgent-fg)" }}>{error}</span>}
        <button type="button" className="btn btn-primary" onClick={() => setCreating("backlog")}>+ New ticket</button>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 md:-mx-6 md:px-6">
        <div className="grid min-w-[1040px] grid-cols-5 gap-3">
          {COLUMNS.map((col) => {
            const items = visible.filter((t) => t.status === col.id && (showOldDone || isRecentDone(t)));
            return (
              <section
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; if (over !== col.id) setOver(col.id); }}
                onDragLeave={() => setOver(null)}
                onDrop={(e) => { e.preventDefault(); if (dragId) move(dragId, col.id); setDragId(null); setOver(null); }}
                className={cn(
                  "flex min-h-[520px] flex-col rounded-lg border border-line bg-panel",
                  over === col.id && dragId && "outline outline-1 -outline-offset-1 outline-dashed outline-purple-hi",
                )}
              >
                <header className="flex items-center gap-2 border-b border-line px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-text-2">
                  <span className="h-2 w-2 rounded-[2px]" style={{ background: COLUMN_COLOUR[col.id] }} />
                  {col.label}
                  <span className="rounded-[3px] border border-line px-[5px] py-[2px] text-[9px] font-semibold tracking-[0.08em] text-text-3" title={`${col.owner} moves tickets into this column`}>
                    {col.owner.toUpperCase()}
                  </span>
                  <span className="ml-auto font-mono text-[11px] font-medium text-text-3">{items.length}</span>
                </header>
                <div className="flex flex-col gap-2 p-2.5">
                  {items.map((t) => (
                    <TicketCard key={t.id} ticket={t} dragging={dragId === t.id} onDragStart={() => setDragId(t.id)} onOpen={() => setOpenId(t.id)} />
                  ))}
                  {loaded && items.length === 0 && <p className="py-6 text-center text-[11.5px] text-text-3">empty</p>}
                </div>
                {col.owner === "human" && col.id !== "done" && (
                  <button type="button" className="mt-auto px-3 py-2 text-left text-xs text-text-3 hover:text-text" onClick={() => setCreating(col.id)}>
                    + Add to {col.label.toLowerCase()}
                  </button>
                )}
                {col.id === "done" && oldDoneCount > 0 && (
                  <button type="button" className="mt-auto px-3 py-2 text-left text-xs text-text-3 hover:text-text" onClick={() => setShowOldDone((v) => !v)}>
                    {showOldDone ? "Hide older" : `Show ${oldDoneCount} older`}
                  </button>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {open && <TicketDialog ticket={open} actor={actor} onClose={() => setOpenId(null)} onChanged={refresh} />}
      {creating && <NewTicketDialog status={creating} actor={actor} onClose={() => setCreating(null)} onCreated={refresh} />}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border border-line-hi px-2.5 py-1 text-[11px] font-medium text-text-2 hover:text-text",
        on && "border-purple-hi bg-card-hi text-text",
      )}
    >
      {children}
    </button>
  );
}
