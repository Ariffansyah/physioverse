"use client";

import { useSyncExternalStore } from "react";

/** Shown floating beside the planet in sky view. */
export type Card = {
  kicker: string;
  title: string;
  body: string;
  /** Extra mono rows, e.g. your time and the record. */
  lines?: string[];
  meta: string;
  cta: string;
  tint: string;
};

/** What clicking a planet should do on the page that is currently open. */
export type Stop = { planet: number; label: string; card?: Card; go: () => void };


/**
 * Which planet is aimed at (-1 for the wide shot) and where each one leads.
 *
 * The menus sit deep inside server-rendered pages and the starfield is a fixed
 * background two levels up, so there is no common client parent to hold this
 * in state. One module-level value is smaller than lifting three whole pages.
 */
let aimed = -1;
let stops: Stop[] = [];
const NONE: Stop[] = [];
const listeners = new Set<() => void>();

const ping = () => {
  for (const notify of listeners) notify();
};

export function setFocus(index: number) {
  if (index === aimed) return;
  aimed = index;
  ping();
}



export function setStops(list: Stop[]) {
  stops = list;
  ping();
}

const subscribe = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

/** Change events, for readers that need to act rather than render. */
export function onFocus(cb: (index: number) => void) {
  const notify = () => cb(aimed);
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
}

export const useFocus = () =>
  useSyncExternalStore(
    subscribe,
    () => aimed,
    () => -1,
  );



export const useStops = () =>
  useSyncExternalStore(
    subscribe,
    () => stops,
    () => NONE,
  );
