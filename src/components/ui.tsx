import { actorName, isHuman, type Priority } from "@/lib/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Vertical rainbow used in the Conclusion logo and the footer bar. */
export function Rainbow({ className }: { className?: string }) {
  const colours = ["#c83737", "#f1ca13", "#529f45", "#0097b2", "#1369af", "#5a3f8c", "#bc448c"];
  return (
    <span className={cn("flex flex-col", className)} aria-hidden>
      {colours.map((c) => <i key={c} className="block flex-1" style={{ background: c }} />)}
    </span>
  );
}

export function Logo() {
  return (
    <span className="flex h-[38px] w-max items-stretch" aria-label="Conclusion">
      <Rainbow className="w-[6px]" />
      <span
        className="flex items-center border border-l-0 border-line-hi px-3 pl-2.5 text-[13px] font-black tracking-[0.14em]"
        style={{ background: "var(--logo-bg)", color: "var(--logo-fg)" }}
      >
        CONCLUSION
      </span>
    </span>
  );
}

export function PriorityTag({ priority }: { priority: Priority }) {
  return <span className={cn("tag", `tag-${priority}`)}>{priority}</span>;
}

export function LabelTag({ label }: { label: string | null }) {
  if (!label) return null;
  return <span className="tag tag-label">{label}</span>;
}

/** Blue circle = human, purple ring = agent. */
export function Avatar({ actor, size = 18 }: { actor: string; size?: number }) {
  const human = isHuman(actor);
  const name = actorName(actor);
  const initials = human
    ? name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "H"
    : "AI";
  return (
    <span
      title={actor}
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white", !human && "outline outline-1 outline-purple-hi")}
      style={{ width: size, height: size, fontSize: size * 0.47, background: human ? "var(--blue)" : "var(--purple)" }}
    >
      {initials}
    </span>
  );
}

export function Who({ actor }: { actor: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] text-text-3">
      <Avatar actor={actor} />
      {actorName(actor)}
    </span>
  );
}

export function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? "yesterday" : `${d} days ago`;
}
