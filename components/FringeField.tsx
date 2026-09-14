"use client";

import { useEffect, useRef } from "react";

const SCREEN_MM = 60; // lebar bidang layar yang digambar
const GROUND = [8, 14, 26] as const; // obsidian, supaya menyatu dengan halaman
const MAX_W = 720; // resolusi internal dibatasi: polanya halus, regangannya tak terlihat
const MAX_H = 300;
const PERIOD = 80; // sekitar 12 gambar per detik

/** Intensitas celah ganda dengan selubung celah tunggal. y dalam meter. */
function intensity(y: number, d: number, L: number, nm: number) {
  const lam = nm * 1e-9;
  const dm = d * 1e-3;
  const k = (Math.PI * y) / (lam * L);
  const env = k * (dm / 5);
  const s = env === 0 ? 1 : Math.sin(env) / env;
  return Math.cos(k * dm) ** 2 * s * s;
}

/**
 * λ dipetakan ke satu pita sempit kuantum ke sampanye, bukan spektrum pelangi.
 *
 * Campuran lurus antara dua ujung itu lewat titik abu di tengah sRGB, dan
 * justru di situlah λ bawaan (550 nm) duduk. Warnanya ditarik menjauh dari
 * abunya sendiri supaya pitanya tetap berwarna di seluruh rentang.
 */
const CHROMA = 1.5;
function hueAt(nm: number) {
  const t = Math.min(1, Math.max(0, (nm - 430) / 270));
  const mix = [0x63, 0xc9, 0xd6].map((v, i) => v + ([0xed, 0xbe, 0x70][i] - v) * t);
  const grey = (mix[0] + mix[1] + mix[2]) / 3;
  return mix.map((v) => Math.min(255, Math.max(0, Math.round(grey + (v - grey) * CHROMA))));
}

/**
 * Medan interferensi hidup di belakang judul. Celahnya menyempit mengikuti
 * kursor, dan terus bernapas sendiri saat kursor diam.
 *
 * Tiga hal yang menjaga halaman depan tetap ringan: buffer piksel dialokasikan
 * sekali lalu ditulis ulang, gambarnya berhenti total begitu apertur keluar
 * layar atau tab disembunyikan, dan bacaan telemetri ditulis langsung ke DOM
 * karena memutar state React tiap frame akan merender ulang seluruh halaman.
 */
export default function FringeField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;

    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const echoes = [...document.querySelectorAll<HTMLElement>("[data-echo]")];

    let img: ImageData | null = null;
    let col = new Float32Array(0);
    let frame = 0;
    let last = -Infinity;
    let onScreen = true;
    // Mulai di sisi kuantum, bukan di tengah: λ bawaan 550 nm jatuh di hijau,
    // dan halaman diam sebaiknya sewarna dengan aksennya sendiri.
    let held = 0.24;
    let aim = 0.24;

    const paint = (t: number) => {
      held += (aim - held) * 0.045; // kursor ditarik, bukan diikuti
      const breath = still ? 0 : Math.sin(t / 5200) * 0.018;

      const d = 0.14 + held * 0.2 + breath;
      const L = 2.1;
      const nm = 470 + held * 160;

      const cw = cv.clientWidth;
      const ch = cv.clientHeight;
      if (cw && ch) {
        const W = Math.min(Math.round(cw), MAX_W);
        const H = Math.min(Math.round(ch), MAX_H);

        // Alokasi ulang hanya saat ukuran berubah. Membuat ImageData baru tiap
        // gambar berarti membuang hampir satu megabita per frame ke pemulung.
        if (cv.width !== W || cv.height !== H || !img) {
          cv.width = W;
          cv.height = H;
          img = ctx.createImageData(W, H);
          col = new Float32Array(W);
        }

        const px = img.data;
        const [R, G, B] = hueAt(nm);
        const [gr, gg, gb] = GROUND;
        const perMm = W / SCREEN_MM;

        for (let x = 0; x < W; x++) {
          col[x] = Math.pow(intensity((x - W / 2) / perMm / 1000, d, L, nm), 0.52);
        }

        for (let y = 0; y < H; y++) {
          // Selubung tegaknya dilebarkan: sin kuadrat menyisakan pita tipis di
          // tengah, dan warnanya tidak sempat terbaca sebelum meredup.
          const rowA = Math.pow(Math.sin(Math.PI * (y / (H - 1))), 0.7);
          let i = y * W * 4;
          for (let x = 0; x < W; x++, i += 4) {
            const a = col[x] * rowA;
            px[i] = gr + (R - gr) * a;
            px[i + 1] = gg + (G - gg) * a;
            px[i + 2] = gb + (B - gb) * a;
            px[i + 3] = 255;
          }
        }
        ctx.putImageData(img, 0, 0);
      }

      const spacing = ((nm * 1e-9 * L) / (d * 1e-3)) * 1000;
      for (const el of echoes) {
        el.textContent =
          el.dataset.echo === "d"
            ? `${d.toFixed(3)} mm`
            : el.dataset.echo === "L"
              ? `${L.toFixed(2)} m`
              : el.dataset.echo === "w"
                ? `${nm.toFixed(0)} nm`
                : `±${Math.min(Math.floor(SCREEN_MM / 2 / spacing), 99)}`;
      }
    };

    const loop = (t: number) => {
      if (t - last > PERIOD) {
        last = t;
        paint(t);
      }
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const sync = () => (onScreen && !document.hidden ? start() : stop());

    const onMove = (e: PointerEvent) => {
      aim = Math.min(1, Math.max(0, e.clientX / innerWidth));
    };

    const watcher = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    watcher.observe(cv);

    addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      stop();
      watcher.disconnect();
      removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full opacity-75" />
  );
}
