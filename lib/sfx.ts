
type Cue = "move" | "select" | "back" | "run" | "win" | "fail";
type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number };

export const CUES: Record<Cue, Note[]> = {
  move: [{ f: 660, t: 0, d: 0.045, g: 0.45 }],
  select: [
    { f: 520, t: 0, d: 0.06 },
    { f: 780, t: 0.05, d: 0.1 },
  ],
  back: [
    { f: 420, t: 0, d: 0.06 },
    { f: 300, t: 0.05, d: 0.1 },
  ],
  run: [
    { f: 220, t: 0, d: 0.12, type: "sawtooth", g: 0.32 },
    { f: 470, t: 0.07, d: 0.14 },
  ],
  win: [
    { f: 523, t: 0, d: 0.1 },
    { f: 659, t: 0.09, d: 0.1 },
    { f: 784, t: 0.18, d: 0.26 },
  ],
  fail: [
    { f: 320, t: 0, d: 0.13, type: "square", g: 0.26 },
    { f: 208, t: 0.11, d: 0.26, type: "square", g: 0.26 },
  ],
};

const KEY = "pv-muted";
let ctx: AudioContext | undefined;
let master: GainNode | undefined;

let off: boolean | undefined;
const listeners = new Set<() => void>();

function current() {
  if (off === undefined) {
    try {
      off = localStorage.getItem(KEY) === "1";
    } catch {
      off = false;
    }
  }
  return off;
}

export const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

export const mutedOnServer = () => false;
export const isMuted = () => (typeof window === "undefined" ? false : current());

export function setMuted(v: boolean) {
  off = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
  }
  for (const fn of listeners) fn();
}

export function unlock() {
  const wake = () => {
    ensure();
    removeEventListener("pointerdown", wake);
    removeEventListener("keydown", wake);
  };
  addEventListener("pointerdown", wake, { once: true });
  addEventListener("keydown", wake, { once: true });
  return () => {
    removeEventListener("pointerdown", wake);
    removeEventListener("keydown", wake);
  };
}

function ensure() {
  if (typeof AudioContext === "undefined") return undefined;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.085;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function play(cue: Cue) {
  if (isMuted()) return;
  const ac = ensure();
  if (!ac || !master) return;

  const now = ac.currentTime;
  for (const n of CUES[cue]) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = n.type ?? "triangle";
    osc.frequency.value = n.f;

    const t0 = now + n.t;
    const peak = n.g ?? 0.6;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.d);

    osc.connect(gain).connect(master);
    osc.start(t0);
    osc.stop(t0 + n.d + 0.02);
  }
}
