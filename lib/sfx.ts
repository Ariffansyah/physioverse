/**
 * Bunyi antarmuka dari osilator, bukan berkas audio.
 *
 * Satu berkas wav pun berarti aset biner di repo, permintaan jaringan, dan
 * lisensi yang harus diurus. Lima nada pendek yang disintesis di tempat
 * memberi hasil yang sama untuk menu dan HUD, dengan nol byte aset.
 */

type Cue = "move" | "select" | "back" | "run" | "win" | "fail";
type Note = { f: number; t: number; d: number; type?: OscillatorType; g?: number };

export const CUES: Record<Cue, Note[]> = {
  // Sorotan pindah: satu ketuk pendek, cukup untuk terasa tanpa jadi berisik.
  move: [{ f: 660, t: 0, d: 0.045, g: 0.45 }],
  // Masuk: dua nada naik.
  select: [
    { f: 520, t: 0, d: 0.06 },
    { f: 780, t: 0.05, d: 0.1 },
  ],
  // Mundur: dua nada yang sama, dibalik arahnya.
  back: [
    { f: 420, t: 0, d: 0.06 },
    { f: 300, t: 0.05, d: 0.1 },
  ],
  // Kirim misi: bunyi mesin yang menyalakan instrumen.
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

// Sakelar senyap dipakai React lewat useSyncExternalStore, jadi bentuknya
// toko eksternal: satu nilai, satu daftar pelanggan.
let off: boolean | undefined;
const listeners = new Set<() => void>();

function current() {
  if (off === undefined) {
    try {
      off = localStorage.getItem(KEY) === "1";
    } catch {
      // Mode privat bisa menolak pembacaan — anggap bunyinya menyala.
      off = false;
    }
  }
  return off;
}

export const subscribe = (fn: () => void) => (listeners.add(fn), () => void listeners.delete(fn));

/** Server tidak punya localStorage; hidrasi mulai dari "menyala", lalu React
    merender ulang dengan nilai sebenarnya begitu klien mengambil alih. */
export const mutedOnServer = () => false;
export const isMuted = () => (typeof window === "undefined" ? false : current());

export function setMuted(v: boolean) {
  off = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    // Senyapnya tetap berlaku untuk sesi ini walau tak bisa disimpan.
  }
  for (const fn of listeners) fn();
}

/**
 * Peramban menahan AudioContext sampai ada gerakan pengguna sungguhan, dan
 * hover tidak termasuk. Dipanggil sekali saat pasang: begitu tombol atau
 * tuts pertama ditekan, konteksnya sudah hidup sebelum nada pertama diminta.
 */
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
    // Sengaja pelan: ini bunyi latar antarmuka, bukan musik.
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

    // Amplop lewat ramp eksponensial — memotong gelombang mentah bikin klik.
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
