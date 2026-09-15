import { CanvasTexture, RepeatWrapping } from "three";


let puff: CanvasTexture | undefined;

export function glowTexture() {
  if (puff) return puff;
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(255,255,255,0.55)");
  g.addColorStop(0.3, "rgba(255,255,255,0.18)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  puff = new CanvasTexture(c);
  return puff;
}


function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const planets = new Map<string, CanvasTexture>();


export function planetTexture(color: string, seed: number) {
  const key = `${color}:${seed}`;
  const hit = planets.get(key);
  if (hit) return hit;

  const W = 256;
  const H = 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const rand = rng(seed);


  const waves = [0, 1, 2].map(() => ({
    k: 2 + rand() * 9,
    phase: rand() * Math.PI * 2,
    amp: 0.06 + rand() * 0.16,
  }));

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);

  for (let y = 0; y < H; y++) {
    const u = y / H;
    let shade = 0;
    for (const w of waves) shade += Math.sin(u * w.k * Math.PI * 2 + w.phase) * w.amp;

    shade += Math.abs(u - 0.5) ** 3 * 2.2;
    ctx.fillStyle = shade > 0 ? "#ffffff" : "#000000";
    ctx.globalAlpha = Math.min(0.42, Math.abs(shade));
    ctx.fillRect(0, y, W, 1);
  }


  for (let i = 0; i < 26; i++) {
    const r = 2 + rand() * 11;
    ctx.globalAlpha = 0.06 + rand() * 0.16;
    ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
    ctx.beginPath();
    ctx.ellipse(rand() * W, rand() * H, r * 1.6, r, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
  const tex = new CanvasTexture(c);
  tex.wrapS = RepeatWrapping;
  planets.set(key, tex);
  return tex;
}
