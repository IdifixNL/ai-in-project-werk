"use client";

import { useSyncExternalStore } from "react";
import { CHAPTERS } from "./chapters";
import { cn } from "@/components/ui";

function readHash(): string {
  const h = window.location.hash.replace("#", "");
  return CHAPTERS.some((c) => c.id === h) ? h : CHAPTERS[0].id;
}

function subscribe(cb: () => void) {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
}

/** Chapter index on the left, one chapter at a time on the right, deep-linkable via #hash. */
export function Guide() {
  const active = useSyncExternalStore(subscribe, readHash, () => CHAPTERS[0].id);
  const idx = CHAPTERS.findIndex((c) => c.id === active);
  const chapter = CHAPTERS[idx];
  const go = (id: string) => {
    history.pushState(null, "", `#${id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-[220px_1fr]">
      <nav className="md:sticky md:top-5 md:self-start">
        <p className="label mb-2">Oefening instructie</p>
        <ol className="m-0 flex list-none flex-row flex-wrap gap-1 p-0 md:flex-col">
          {CHAPTERS.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => go(c.id)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-[12px] text-text-2 hover:text-text",
                  c.id === active && "bg-purple-10 text-text shadow-[inset_2px_0_0_var(--purple-hi)]",
                )}
              >
                <span className={cn("mt-px font-mono text-[10px]", c.id === active ? "text-purple-hi" : "text-text-3")}>{i + 1}</span>
                <span>
                  <span className="block font-semibold">{c.title}</span>
                  <span className="hidden text-[11px] text-text-3 md:block">{c.short}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <article className="flex min-w-0 flex-col gap-4 rounded-lg border border-line bg-panel px-5 py-5 md:px-7">
        <header>
          <p className="label mb-1">Hoofdstuk {idx + 1} van {CHAPTERS.length}</p>
          <h2 className="m-0 text-[22px] font-black tracking-tight" style={{ textWrap: "balance" }}>{chapter.title}</h2>
        </header>
        {chapter.body}
        <footer className="mt-2 flex items-center justify-between border-t border-line pt-4">
          {idx > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => go(CHAPTERS[idx - 1].id)}>← {CHAPTERS[idx - 1].title}</button>
          ) : <span />}
          {idx < CHAPTERS.length - 1 ? (
            <button type="button" className="btn btn-primary" onClick={() => go(CHAPTERS[idx + 1].id)}>{CHAPTERS[idx + 1].title} →</button>
          ) : (
            <a href="/board" className="btn btn-primary no-underline">Naar het bord →</a>
          )}
        </footer>
      </article>
    </div>
  );
}
