"use client";

import { useSyncExternalStore } from "react";

const KEY = "cockpit-user";
const EVENT = "cockpit-user-change";

function read(): string {
  try { return localStorage.getItem(KEY) || ""; } catch { return ""; }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener("storage", cb); };
}

/**
 * Who is sitting at this browser. Stored per browser, no accounts.
 * Every write from the UI is sent as actor "human:<name>".
 */
export function useIdentity(): [string, (name: string) => void] {
  const name = useSyncExternalStore(subscribe, read, () => "");
  const update = (n: string) => {
    try { localStorage.setItem(KEY, n); } catch {}
    window.dispatchEvent(new Event(EVENT));
  };
  return [name, update];
}

export function humanActor(name: string): string {
  return `human:${name.trim() || "you"}`;
}
