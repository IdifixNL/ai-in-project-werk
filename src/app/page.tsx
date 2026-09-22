import { getStats } from "@/lib/kanban";
import { Kpis } from "@/components/dashboard/kpis";
import { ThroughputChart } from "@/components/dashboard/throughput-chart";
import { WorkByColumn } from "@/components/dashboard/work-by-column";
import { Activity } from "@/components/dashboard/activity";

export const dynamic = "force-dynamic";

/**
 * The dashboard. Everything here comes from one place: getStats() in src/lib/kanban.ts,
 * also exposed as GET /api/stats. Add a KPI by extending that function and dropping a tile here.
 */
export default async function DashboardPage() {
  const stats = await getStats();
  return (
    <div className="flex flex-col gap-4">
      <Kpis stats={stats} />
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-lg border border-line bg-panel px-4 py-3.5">
          <h3 className="m-0 text-xs font-bold">Throughput</h3>
          <p className="mb-3 mt-0 text-[11px] text-text-3">tickets moved to done, per week, last 8 weeks</p>
          <ThroughputChart data={stats.throughput} />
        </section>
        <section className="rounded-lg border border-line bg-panel px-4 py-3.5">
          <h3 className="m-0 text-xs font-bold">Work by column</h3>
          <p className="mb-3 mt-0 text-[11px] text-text-3">where the {stats.open + stats.counts.done} tickets sit right now</p>
          <WorkByColumn counts={stats.counts} />
          <h3 className="mb-0 mt-5 text-xs font-bold">Recent activity</h3>
          <p className="mb-2 mt-0 text-[11px] text-text-3">from the ticket journey log</p>
          <Activity events={stats.recent} />
        </section>
      </div>
      <aside className="rounded-lg border border-dashed border-line-hi px-3.5 py-3 text-[11.5px] text-text-2">
        <b className="text-purple-hi">Workshop starting point.</b> Every number on this page comes from one endpoint,{" "}
        <code className="font-mono text-[11px] text-text">GET /api/stats</code>. The exercise: give your AI team a ticket to add the
        KPI your project needs (revenue per client, hours per sprint, open risks), and review what it ships.
      </aside>
    </div>
  );
}
