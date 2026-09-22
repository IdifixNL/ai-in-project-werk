/** Plain SVG line chart, no library. Scale derives from the data. */
export function ThroughputChart({ data }: { data: { week: string; done: number }[] }) {
  const W = 560, H = 190, left = 40, right = 20, top = 20, bottom = 40;
  const innerW = W - left - right, innerH = H - top - bottom;
  const max = Math.max(2, ...data.map((d) => d.done));
  const step = max <= 6 ? 2 : Math.ceil(max / 3);
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(max);
  const yMax = ticks[ticks.length - 1];

  const x = (i: number) => left + (data.length === 1 ? innerW / 2 : (i * innerW) / (data.length - 1));
  const y = (v: number) => top + innerH - (v / yMax) * innerH;
  const points = data.map((d, i) => `${x(i)},${y(d.done)}`);
  const line = `M${points.join(" L")}`;
  const area = `${line} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block" role="img" aria-label="Tickets done per week">
      <defs>
        <linearGradient id="tp-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--purple-hi)" stopOpacity="0.4" />
          <stop offset="1" stopColor="var(--purple-hi)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={W - right} y1={y(t)} y2={y(t)} stroke="var(--line)" />
          <text x={left - 10} y={y(t) + 4} textAnchor="end" fontSize="10" fill="var(--text-3)">{t}</text>
        </g>
      ))}
      <path d={area} fill="url(#tp-fill)" />
      <path d={line} fill="none" stroke="var(--purple-hi)" strokeWidth="2" />
      {data.map((d, i) => (
        <g key={d.week}>
          <circle cx={x(i)} cy={y(d.done)} r={i === data.length - 1 ? 4.5 : 3} fill={i === data.length - 1 ? "var(--purple-hi)" : "var(--panel)"} stroke="var(--purple-hi)" strokeWidth="2" />
          <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="10" fill="var(--text-3)">{d.week.slice(-3).toLowerCase()}</text>
        </g>
      ))}
    </svg>
  );
}
