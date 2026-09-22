"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COLUMNS, LABELS, PRIORITIES, STATUSES, actorName, ownerActor, type Comment, type Priority, type Status, type Ticket, type TicketEvent } from "@/lib/types";
import { api } from "@/lib/client-api";
import { Avatar, PriorityTag, LabelTag, cn, timeAgo } from "@/components/ui";
import { describe } from "@/components/dashboard/activity";

type Tab = "request" | "plan" | "result" | "journey";

const TABS: { id: Tab; label: string; owner?: "human" | "agent" }[] = [
  { id: "request", label: "Request", owner: "human" },
  { id: "plan", label: "AI Plan", owner: "agent" },
  { id: "result", label: "Result", owner: "agent" },
  { id: "journey", label: "Journey" },
];

export function TicketDialog({ ticket, actor, onClose, onChanged }: {
  ticket: Ticket; actor: string; onClose: () => void; onChanged: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<Tab>(ticket.status === "review" ? "result" : ticket.plan ? "plan" : "request");
  const [comments, setComments] = useState<Comment[]>([]);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  // Local copies of the editable text fields, saved on blur.
  const [title, setTitle] = useState(ticket.title);
  const [description, setDescription] = useState(ticket.description);
  const [plan, setPlan] = useState(ticket.plan ?? "");
  const [outcome, setOutcome] = useState(ticket.outcome ?? "");

  useEffect(() => { ref.current?.showModal(); }, []);

  const load = useCallback(async () => {
    try {
      const [c, e] = await Promise.all([
        api<Comment[]>(`/api/kanban/${ticket.id}/comments`),
        api<TicketEvent[]>(`/api/kanban/${ticket.id}/events`),
      ]);
      setComments(c);
      setEvents(e);
    } catch (err) {
      setError((err as Error).message);
    }
  }, [ticket.id]);

  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load, ticket.updatedAt]);

  async function patch(body: Record<string, unknown>) {
    setError(null);
    try {
      await api(`/api/kanban/${ticket.id}`, { method: "PATCH", body: { ...body, actor } });
      onChanged();
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      await api(`/api/kanban/${ticket.id}/comments`, { method: "POST", body: { author: actor, content: draft } });
      setDraft("");
      load();
      onChanged();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const stepIndex = STATUSES.indexOf(ticket.status);

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(900px,calc(100vw-24px))] rounded-[10px] border border-line-hi bg-card p-0 text-text shadow-2xl">
      <div className="flex flex-col gap-3 px-5 pt-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-[11px] text-text-3">{ticket.ref}</span>
          <input
            id="ticket-title"
            className="min-w-[200px] flex-1 border-0 bg-transparent p-0 text-[17px] font-bold tracking-tight outline-none"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && title !== ticket.title && patch({ title })}
          />
          <PriorityTag priority={ticket.priority} />
          <LabelTag label={ticket.label} />
          <button type="button" className="btn btn-ghost !px-2" onClick={() => ref.current?.close()} aria-label="Close">✕</button>
        </div>

        <ol className="m-0 flex list-none items-center p-0">
          {COLUMNS.map((c, i) => (
            <li key={c.id} className="contents">
              {i > 0 && <span className={cn("mx-2.5 h-px min-w-4 flex-1", i <= stepIndex ? "bg-purple" : "bg-line-hi")} />}
              <span className={cn("flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.08em]", i < stepIndex && "text-text-2", i === stepIndex ? "text-text" : i > stepIndex && "text-text-3")}>
                <span className={cn(
                  "h-2.5 w-2.5 rounded-full border-2",
                  i < stepIndex && "border-purple bg-purple",
                  i === stepIndex && "border-purple-hi bg-purple-hi shadow-[0_0_10px_var(--purple-hi)]",
                  i > stepIndex && "border-line-hi bg-card",
                )} />
                <span className="hidden sm:inline">{c.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-1 flex gap-0.5 border-b border-line px-5 pt-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn("flex items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-xs font-semibold text-text-3", tab === t.id && "border-purple-hi text-text")}
          >
            {t.label}
            {t.owner && (
              <span className={cn("rounded-[3px] border px-[5px] py-[1px] text-[9px] tracking-[0.06em]", t.owner === "agent" ? "border-purple-hi/40 text-purple-hi" : "border-blue/50 text-blue")}>
                {t.owner.toUpperCase()}
              </span>
            )}
            {t.id === "plan" && ticket.plan && <span className="h-1.5 w-1.5 rounded-full bg-purple-hi" />}
            {t.id === "result" && (ticket.outcome || ticket.evidence.length > 0) && <span className="h-1.5 w-1.5 rounded-full bg-purple-hi" />}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_230px]">
        <div className="px-5 pb-4 pt-4 md:border-r md:border-line">
          {tab === "request" && (
            <div className="flex flex-col gap-2">
              <h4 className="label m-0">Request, in plain language</h4>
              <textarea
                id="ticket-description"
                className="field"
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => description !== ticket.description && patch({ description })}
                placeholder="What is needed and why. Technical detail goes in the AI plan."
              />
              <p className="m-0 text-[11px] text-text-3">Raised by {actorName(ticket.createdBy)} {timeAgo(ticket.createdAt)}. Saved when you click away.</p>
            </div>
          )}
          {tab === "plan" && (
            <div className="flex flex-col gap-2">
              <h4 className="label m-0">AI plan, written before any code</h4>
              {ticket.plan ? (
                <div className="prose-plan">{ticket.plan}</div>
              ) : (
                <p className="m-0 text-[12px] text-text-3">No plan yet. The agent writes it here when it picks the ticket up (PATCH with <code className="font-mono">plan</code>).</p>
              )}
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] text-text-3">Edit by hand</summary>
                <textarea id="ticket-plan" className="field mt-2" rows={8} value={plan} onChange={(e) => setPlan(e.target.value)} onBlur={() => plan !== (ticket.plan ?? "") && patch({ plan })} />
              </details>
            </div>
          )}
          {tab === "result" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <h4 className="label m-0">Verdict</h4>
                {ticket.outcome ? <div className="prose-plan">{ticket.outcome}</div> : <p className="m-0 text-[12px] text-text-3">No verdict yet. The agent writes what it did and how it checked it (PATCH with <code className="font-mono">outcome</code>).</p>}
                <details>
                  <summary className="cursor-pointer text-[11px] text-text-3">Edit by hand</summary>
                  <textarea id="ticket-outcome" className="field mt-2" rows={5} value={outcome} onChange={(e) => setOutcome(e.target.value)} onBlur={() => outcome !== (ticket.outcome ?? "") && patch({ outcome })} />
                </details>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="label m-0">Evidence ({ticket.evidence.length})</h4>
                {ticket.evidence.length === 0 && <p className="m-0 text-[12px] text-text-3">Nothing attached. Agents append with <code className="font-mono">appendEvidence: [{"{caption, url?}"}]</code>.</p>}
                {ticket.evidence.map((ev, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-md border border-line bg-panel px-3 py-2 text-[12px]">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green" />
                    <div className="min-w-0 flex-1">
                      <div className="text-text">{ev.caption || "(no caption)"}</div>
                      {ev.url && <a href={ev.url} target="_blank" rel="noreferrer" className="break-all font-mono text-[11px] text-purple-hi">{ev.url}</a>}
                    </div>
                    <span className="whitespace-nowrap font-mono text-[10px] text-text-3">{timeAgo(ev.ts)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {tab === "journey" && (
            <div className="flex flex-col gap-2">
              <h4 className="label m-0">Everything that happened to this ticket</h4>
              <ol className="m-0 flex list-none flex-col p-0">
                {events.map((e) => (
                  <li key={e.id} className="grid grid-cols-[18px_1fr_auto] items-start gap-2.5 border-t border-line py-2 text-[11.5px] first:border-t-0">
                    <span className="ml-1 mt-[5px] h-2 w-2 rounded-full" style={{ background: e.kind === "refused" ? "var(--red)" : e.kind === "status" ? "var(--cyan)" : e.kind === "created" ? "var(--text-3)" : "var(--purple-hi)" }} />
                    <span className="text-text-2">
                      <b className="font-semibold text-text">{actorName(e.actor)}</b> {describe(e)}
                      {e.note && e.kind !== "result" && e.kind !== "plan" && <span className="text-text-3"> · {e.note}</span>}
                    </span>
                    <span className="whitespace-nowrap font-mono text-[10px] text-text-3">{timeAgo(e.createdAt)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-3.5 px-4 py-4 text-xs">
          <Field label="Status">
            <select id="ticket-status" className="field" value={ticket.status} onChange={(e) => patch({ status: e.target.value as Status })}>
              {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Owner">
            <div className="flex items-center gap-2">
              {ticket.owner && <Avatar actor={ownerActor(ticket.owner)} />}
              <input id="ticket-owner" className="field" defaultValue={ticket.owner ?? ""} placeholder="human:Nico or agent:builder" onBlur={(e) => e.target.value !== (ticket.owner ?? "") && patch({ owner: e.target.value })} />
            </div>
          </Field>
          <Field label="Priority">
            <select id="ticket-priority" className="field" value={ticket.priority} onChange={(e) => patch({ priority: e.target.value as Priority })}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Label">
            <select id="ticket-label" className="field" value={ticket.label ?? ""} onChange={(e) => patch({ label: e.target.value || null })}>
              <option value="">none</option>
              {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
              {ticket.label && !(LABELS as readonly string[]).includes(ticket.label) && <option value={ticket.label}>{ticket.label}</option>}
            </select>
          </Field>
          <Field label="Updated"><span className="font-mono text-[11px] text-text-2">{timeAgo(ticket.updatedAt)}</span></Field>
          {ticket.status === "review" && (
            <div className="mt-1 flex flex-col gap-2 rounded-md border border-line bg-panel p-3">
              <span className="label">Your call</span>
              <button type="button" className="btn btn-primary" onClick={() => patch({ status: "done", note: "approved" })}>Approve, move to done</button>
              <button type="button" className="btn btn-ghost" onClick={() => { const why = window.prompt("What needs to change?"); if (why) patch({ status: "backlog", note: why }); }}>Request changes</button>
            </div>
          )}
          {error && <p className="m-0 text-[11.5px]" style={{ color: "var(--tone-urgent-fg)" }}>{error}</p>}
        </aside>
      </div>

      <div className="border-t border-line px-5 pb-4 pt-3.5">
        <h4 className="label m-0 mb-2">Comments</h4>
        <div className="flex flex-col">
          {comments.map((c) => (
            <div key={c.id} className="grid grid-cols-[22px_1fr] gap-2.5 py-2 text-xs">
              <Avatar actor={c.author} size={22} />
              <div>
                <div className="flex items-baseline gap-2"><b className="font-semibold">{actorName(c.author)}</b><span className="font-mono text-[10px] text-text-3">{timeAgo(c.createdAt)}</span></div>
                <p className="m-0 mt-0.5 whitespace-pre-wrap text-text-2">{c.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="m-0 py-1 text-[11.5px] text-text-3">No comments yet.</p>}
        </div>
        <form onSubmit={postComment} className="mt-2 flex gap-2">
          <input id="ticket-comment" className="field" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a comment..." />
          <button type="submit" className="btn btn-ghost" disabled={!draft.trim()}>Post</button>
        </form>
      </div>
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label">{label}</span>
      {children}
    </div>
  );
}
