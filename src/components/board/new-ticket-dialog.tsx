"use client";

import { useEffect, useRef, useState } from "react";
import { LABELS, PRIORITIES, type Priority, type Status } from "@/lib/types";
import { api } from "@/lib/client-api";

export function NewTicketDialog({ status, actor, onClose, onCreated }: {
  status: Status; actor: string; onClose: () => void; onCreated: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [label, setLabel] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { ref.current?.showModal(); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/kanban", { method: "POST", body: { title, description, priority, label: label || null, status, actor } });
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <dialog ref={ref} onClose={onClose} className="m-auto w-[min(560px,calc(100vw-32px))] rounded-[10px] border border-line-hi bg-card p-0 text-text shadow-2xl">
      <form onSubmit={submit} className="flex flex-col gap-3.5 p-5">
        <div>
          <h2 className="m-0 text-[15px] font-bold">New ticket</h2>
          <p className="m-0 mt-1 text-[11.5px] text-text-2">
            Write the request in plain language: what is needed and why. Technical detail belongs in the AI plan, which the agent writes when it picks the ticket up.
          </p>
        </div>
        <label className="flex flex-col gap-1">
          <span className="label">Title</span>
          <input id="new-title" className="field" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus placeholder="Show revenue per client on the dashboard" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="label">Request</span>
          <textarea id="new-description" className="field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What should be different when this is done, and for whom?" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="label">Priority</span>
            <select id="new-priority" className="field" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="label">Label</span>
            <select id="new-label" className="field" value={label} onChange={(e) => setLabel(e.target.value)}>
              <option value="">none</option>
              {LABELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="m-0 text-[11.5px]" style={{ color: "var(--tone-urgent-fg)" }}>{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={() => ref.current?.close()}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy || !title.trim()}>Create in {status.replace("_", " ")}</button>
        </div>
      </form>
    </dialog>
  );
}
