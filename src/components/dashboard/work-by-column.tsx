import { COLUMNS, type Status } from "@/lib/types";

const COLOUR: Record<Status, string> = {
  backlog: "var(--text-3)", todo: "var(--blue)", in_progress: "var(--cyan)", review: "var(--yellow)", done: "var(--green)",
};

export function WorkByColumn({ counts }: { counts: Record<Status, number> }) {
  const max = Math.max(1, ...Object.values(counts));
  return (
    <div className="grid grid-cols-[110px_1fr_36px] items-center gap-x-3 gap-y-2 text-[11.5px]">
      {COLUMNS.map((c) => (
        <div key={c.id} className="contents">
          <span className="text-text-2">{c.label}</span>
          <div className="h-2 overflow-hidden rounded-sm bg-line">
            <i className="block h-full rounded-sm" style={{ width: `${(100 * counts[c.id]) / max}%`, background: COLOUR[c.id] }} />
          </div>
          <span className="text-right font-mono text-[11px] text-text-2 tabular-nums">{counts[c.id]}</span>
        </div>
      ))}
    </div>
  );
}
