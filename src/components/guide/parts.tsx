import type { ReactNode } from "react";

/** Small building blocks for the guide chapters. Content lives in chapters.tsx. */

export function Lead({ children }: { children: ReactNode }) {
  return <p className="m-0 max-w-[64ch] text-[13px] leading-relaxed text-text-2">{children}</p>;
}

export function H({ children }: { children: ReactNode }) {
  return <h4 className="label m-0 mt-2">{children}</h4>;
}

export function Grid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">{children}</div>;
}

export function Card({ title, href, level, children }: { title: string; href?: string; level?: "beginner" | "gemiddeld"; children: ReactNode }) {
  const heading = href ? <a href={href} className="text-purple-hi no-underline hover:underline">{title}</a> : title;
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-line bg-card px-3.5 py-3 text-[12.5px] leading-relaxed text-text-2">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-text">
        {heading}
        {level && <span className={`tag ${level === "beginner" ? "tag-medium" : "tag-high"}`}>{level}</span>}
      </div>
      <div>{children}</div>
    </div>
  );
}

export function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[24px_1fr] gap-3 text-[12.5px] leading-relaxed text-text-2">
          <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-line-hi font-mono text-[10px] text-text-3">{i + 1}</span>
          <span>{it}</span>
        </li>
      ))}
    </ol>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="m-0 flex list-none flex-col gap-2 p-0 text-[12.5px] leading-relaxed text-text-2">
      {items.map((it, i) => (
        <li key={i} className="grid grid-cols-[14px_1fr] gap-2">
          <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-purple-hi" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export function Code({ children }: { children: ReactNode }) {
  return <code className="rounded-[3px] bg-purple-10 px-1.5 py-0.5 font-mono text-[11px] text-text">{children}</code>;
}

export function Pre({ children }: { children: string }) {
  return <pre className="m-0 overflow-x-auto rounded-md border border-line bg-card px-3.5 py-3 font-mono text-[11.5px] leading-relaxed text-text">{children}</pre>;
}

/** A prompt the participant can type into Claude Code. */
export function Prompt({ children }: { children: ReactNode }) {
  return (
    <span className="my-1.5 block rounded-md border-l-2 border-purple-hi bg-purple-10 px-3 py-2 text-[12px] italic text-text">
      {children}
    </span>
  );
}

/** Ask (human) / answer (agent) exchange, to show how a conversation with an agent goes. */
export function Chat({ lines }: { lines: { who: "jij" | "pm" | "builder"; text: ReactNode }[] }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border border-line bg-card px-3.5 py-3">
      {lines.map((l, i) => (
        <div key={i} className="grid grid-cols-[52px_1fr] gap-2 text-[12px] leading-relaxed">
          <span className={`font-mono text-[10px] uppercase tracking-[0.08em] ${l.who === "jij" ? "text-blue" : "text-purple-hi"}`}>{l.who}</span>
          <span className={l.who === "jij" ? "text-text" : "text-text-2"}>{l.text}</span>
        </div>
      ))}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="m-0 rounded-md border border-dashed border-line-hi px-3.5 py-2.5 text-[12px] text-text-2">{children}</p>;
}
