"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isMuted, mutedOnServer, play, setMuted, subscribe, unlock } from "@/lib/sfx";

export default function SoundToggle({ className = "" }: { className?: string }) {
  const off = useSyncExternalStore(subscribe, isMuted, mutedOnServer);

  useEffect(unlock, []);

  return (
    <button
      type="button"
      aria-pressed={!off}
      aria-label={off ? "Nyalakan bunyi" : "Matikan bunyi"}
      className={`font-mono text-[11px] tracking-[0.18em] transition-colors duration-500 ease-settle hover:text-champagne ${
        off ? "text-ashdim" : "text-ash"
      } ${className}`}
      onClick={() => {
        setMuted(!off);
        if (off) play("select");
      }}
    >
      <span aria-hidden="true">{off ? "◂×" : "◂))"}</span> BUNYI
    </button>
  );
}
