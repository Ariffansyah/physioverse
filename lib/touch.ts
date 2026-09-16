"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";
const NARROW = "(max-width: 39.99rem)";

const watch = (query: string) => (cb: () => void) => {
  const m = matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

const coarse = watch(QUERY);
const small = watch(NARROW);


export const useTouch = () =>
  useSyncExternalStore(coarse, () => matchMedia(QUERY).matches, () => false);


export const useNarrow = () =>
  useSyncExternalStore(small, () => matchMedia(NARROW).matches, () => false);
