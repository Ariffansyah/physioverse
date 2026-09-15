"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(pointer: coarse)";

const subscribe = (cb: () => void) => {
  const m = matchMedia(QUERY);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};


export const useTouch = () =>
  useSyncExternalStore(subscribe, () => matchMedia(QUERY).matches, () => false);
