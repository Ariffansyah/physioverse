"use client";

import { useSyncExternalStore } from "react";

export type Card = {
  kicker: string;
  title: string;
  body: string;
  lines?: string[];
  meta: string;
  cta: string;
  tint: string;
};

export type Stop = { planet: number; label: string; card?: Card; go: () => void };


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
