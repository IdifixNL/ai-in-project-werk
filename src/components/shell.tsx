"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { Logo, Rainbow, Avatar, cn } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { useIdentity } from "@/lib/identity";

const NAV = [
  { href: "/", label: "Dashboard", icon: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></> },
  { href: "/board", label: "Board", icon: <><rect x="3" y="4" width="5" height="16" /><rect x="10" y="4" width="5" height="10" /><rect x="17" y="4" width="4" height="13" /></> },
];

export function Shell({ projectName, children }: { projectName: string; children: ReactNode }) {
  const path = usePathname();
  const [name, setName] = useIdentity();
  const section = NAV.find((n) => n.href === path)?.label ?? "Cockpit";

  return (
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[232px_1fr]">
      <aside className="relative flex flex-row items-center gap-4 border-b border-line bg-panel px-4 py-3 md:flex-col md:items-stretch md:border-b-0 md:border-r md:px-4 md:pt-[18px] md:pb-4">
        <span className="absolute inset-y-0 left-0 w-[2px] bg-purple" aria-hidden />
        <div>
          <Logo />
          <div className="label mt-2 hidden md:block">Cockpit Starter</div>
        </div>
        <nav className="flex flex-row gap-0.5 md:mt-7 md:flex-col">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 font-medium text-text-2 no-underline hover:text-text",
                path === n.href && "bg-purple-10 text-text shadow-[inset_2px_0_0_var(--purple-hi)]",
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{n.icon}</svg>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto hidden border-t border-line pt-4 text-xs text-text-2 md:block">
          <b className="block font-semibold text-text">{projectName}</b>
          <code className="font-mono text-[11px] text-text-3">SQLite · localhost · no auth</code>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-panel px-4 py-3 md:px-6">
          <h1 className="m-0 text-[15px] font-bold tracking-tight">
            <span className="font-normal text-text-3">{section} / </span>{projectName}
          </h1>
          <div className="flex-1" />
          <label className="flex items-center gap-2 text-xs text-text-2">
            <Avatar actor={`human:${name || "you"}`} />
            <span className="hidden sm:inline">You are</span>
            <input
              id="identity"
              className="field w-[110px] !py-1 !text-xs"
              placeholder="your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 pt-5 pb-7 md:px-6">{children}</main>

        <footer className="flex h-[34px] items-center gap-3.5 border-t border-line bg-black px-4 md:px-6">
          <Rainbow className="h-4 w-1" />
          <span className="text-[10px] font-bold tracking-[0.2em] text-white">CELEBRATE DIFFERENCES, CREATE TOGETHER</span>
          <em className="ml-auto hidden font-mono text-[10px] not-italic text-[#6c6f80] sm:inline">cockpit-starter v0.1</em>
        </footer>
      </div>
    </div>
  );
}
