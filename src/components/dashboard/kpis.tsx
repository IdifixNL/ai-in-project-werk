import type { Stats } from "@/lib/types";
import { cn } from "@/components/ui";

function Tile({ label, value, detail, tone, suffix }: { label: string; value: number | string; detail: string; tone?: "good" | "warn"; suffix?: string }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-4 pb-3 pt-3.5">
      <div className="label">{label}</div>
      <div className={cn("mt-1.5 text-[30px] font-black leading-none tracking-tight tabular-nums", tone === "warn" && "text-warn")}>
        {value}{suffix && <span className="text-base text-text-3">{suffix}</span>}
      </div>
      <div className={cn("mt-2 text-[11px] text-text-2", tone === "good" && "text-good", tone === "warn" && "text-warn")}>{detail}</div>
    </div>
  );
}

export function Kpis({ stats }: { stats: Stats }) {
  const c = stats.counts;
  const delta = stats.doneThisWeek - stats.doneLastWeek;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Tile label="Open tickets" value={stats.open} detail={`${c.backlog} backlog · ${c.todo} todo · ${c.in_progress} in progress · ${c.review} review`} />
      <Tile
        label="Awaiting your review"
        value={stats.awaitingReview}
        tone={stats.awaitingReview > 0 ? "warn" : undefined}
        detail={stats.oldestReviewHours === null ? "nothing waiting" : `oldest waiting ${stats.oldestReviewHours} h`}
      />
      <Tile
        label="Done this week"
        value={stats.doneThisWeek}
        tone={delta > 0 ? "good" : undefined}
        detail={delta === 0 ? "same as last week" : `${delta > 0 ? "+" : ""}${delta} vs last week`}
      />
      <Tile
        label="Agent share"
        value={stats.agentSharePct ?? "–"}
        suffix={stats.agentSharePct === null ? undefined : "%"}
        detail="of ticket moves made by an agent"
      />
    </div>
  );
}
