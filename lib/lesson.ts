import { BENCH, RAIL, SLIT, type ChamberKey, type Control, type Level } from "./levels";
import {
  AIR,
  GRAVITY,
  MU,
  apoapsis,
  circularSpeed,
  dragForce,
  optics,
  orbitPeriod,
  topSpeed,
} from "./physics";


export type Step = { label: string; math: string; value: string };

export type Lesson = {

  levelId: string;
  title: string;
  intro: string;
  body: string[];
  controls: Control[];
  defaults: Record<string, number>;
  camera: [number, number, number];
  target: [number, number, number];
  steps: (p: Record<string, number>, level: Level) => Step[];
};

const n = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : "tak hingga");


export const LESSONS: Record<ChamberKey, Lesson> = {
  ballistics: {
    levelId: "bay-01",
    title: "Gerak Parabola",
    intro:
      "Peluru yang ditembakkan miring bergerak lurus beraturan ke samping dan jatuh dipercepat ke bawah, dua duanya sekaligus.",
    body: [
      "Ke arah mendatar tidak ada gaya, jadi kecepatan mendatarnya tetap dari awal sampai mendarat. Ke arah tegak ada gravitasi, jadi kecepatan tegaknya berkurang, berhenti sesaat di puncak, lalu bertambah ke bawah.",
      "Karena itu lintasannya berbentuk parabola. Naikkan sudut dan peluru melambung lebih tinggi tapi kurang jauh ke depan, turunkan sudut dan sebaliknya. Tanpa hambatan udara, jarak terjauh selalu jatuh di sudut 45 derajat.",
    ],
    controls: [
      { key: "angle", label: "Sudut tembak", unit: "°", min: 10, max: 80, step: 1 },
      { key: "speed", label: "Kecepatan awal", unit: "m/s", min: 5, max: 25, step: 0.5 },
    ],
    defaults: { angle: 45, speed: 14 },
    camera: [-13, 9, 27],
    target: [-12, 2, 0],
    steps: (p) => {
      const rad = (p.angle * Math.PI) / 180;
      const vx = p.speed * Math.cos(rad);
      const vy = p.speed * Math.sin(rad);
      const t = (2 * vy) / GRAVITY;
      return [
        {
          label: "Sudutnya diubah ke radian",
          math: `θ = ${p.angle}° × π / 180`,
          value: `${n(rad, 3)} rad`,
        },
        {
          label: "Kecepatan dipecah jadi dua arah",
          math: "vx = v · cosθ , vy = v · sinθ",
          value: `${n(vx)} m/s dan ${n(vy)} m/s`,
        },
        {
          label: "Lama peluru di udara",
          math: `t = 2 · vy / g = 2 × ${n(vy)} / ${GRAVITY}`,
          value: `${n(t)} s`,
        },
        {
          label: "Jarak mendatar sampai mendarat",
          math: `R = vx · t = ${n(vx)} × ${n(t)}`,
          value: `${n(vx * t)} m`,
        },
        {
          label: "Titik paling tinggi",
          math: `h = vy² / (2g) = ${n(vy)}² / ${2 * GRAVITY}`,
          value: `${n(vy ** 2 / (2 * GRAVITY))} m`,
        },
      ];
    },
  },

  court: {
    levelId: "court-01",
    title: "Parabola yang Dinilai di Satu Titik",
    intro:
      "Bola basket memakai rumus parabola yang sama, tapi yang dinilai bukan jarak jatuhnya melainkan tingginya saat melewati ring.",
    body: [
      "Bola lepas dari tangan pada ketinggian tertentu, bukan dari lantai. Tinggi lepas itu ikut masuk hitungan dan jadi titik nol lintasannya.",
      "Cari dulu berapa lama bola sampai di jarak ring, baru hitung tingginya pada detik itu. Kalau hasilnya pas setinggi ring, bola masuk.",
    ],
    controls: [
      { key: "h0", label: "Tinggi lepas", unit: "m", min: 1.4, max: 2.6, step: 0.05 },
      { key: "angle", label: "Sudut lempar", unit: "°", min: 20, max: 75, step: 1 },
      { key: "speed", label: "Kecepatan lempar", unit: "m/s", min: 6, max: 16, step: 0.1 },
    ],
    defaults: { h0: 2, angle: 50, speed: 9.5 },
    camera: [-14.5, 7, 20],
    target: [-14.5, 1.8, 0],
    steps: (p, level) => {
      const x = level.marker ?? 8;
      const rad = (p.angle * Math.PI) / 180;
      const vx = p.speed * Math.cos(rad);
      const vy = p.speed * Math.sin(rad);
      const t = x / vx;
      const y = p.h0 + vy * t - 0.5 * GRAVITY * t * t;
      return [
        {
          label: "Kecepatan dipecah jadi dua arah",
          math: "vx = v · cosθ , vy = v · sinθ",
          value: `${n(vx)} m/s dan ${n(vy)} m/s`,
        },
        {
          label: `Waktu sampai di ring (${x} m)`,
          math: `t = x / vx = ${x} / ${n(vx)}`,
          value: `${n(t)} s`,
        },
        {
          label: "Yang dinaikkan kecepatan tegak",
          math: `vy · t = ${n(vy)} × ${n(t)}`,
          value: `${n(vy * t)} m`,
        },
        {
          label: "Yang diturunkan gravitasi",
          math: `½ · g · t² = 0.5 × ${GRAVITY} × ${n(t)}²`,
          value: `${n(0.5 * GRAVITY * t * t)} m`,
        },
        {
          label: "Tinggi bola pas di ring",
          math: `y = h₀ + vy·t − ½g·t² = ${n(p.h0)} + ${n(vy * t)} − ${n(0.5 * GRAVITY * t * t)}`,
          value: `${n(y)} m`,
        },
      ];
    },
  },

  photonics: {
    levelId: "hall-01",
    title: "Lensa Cembung",
    intro:
      "Lensa cembung mengumpulkan sinar yang datang sejajar ke satu titik fokus. Dari situ letak dan ukuran bayangan bisa dihitung, tidak perlu diukur.",
    body: [
      "Jarak benda ke lensa disebut s, jarak bayangan ke lensa disebut s aksen. Keduanya terikat satu rumus dengan jarak fokus f.",
      "Kalau benda lebih jauh dari dua kali fokus, bayangannya lebih kecil dan terbalik. Kalau benda didekatkan ke titik fokus, bayangannya melar dan menjauh. Tepat di fokus, sinarnya keluar sejajar dan bayangannya tidak pernah terbentuk.",
    ],
    controls: [
      { key: "lensX", label: "Posisi lensa", unit: "m", min: -8, max: 4, step: 0.05 },
      { key: "focal", label: "Jarak fokus f", unit: "m", min: 1, max: 5, step: 0.05 },
    ],
    defaults: { lensX: -4, focal: 3 },
    camera: [-2, 7, 23],
    target: [-2.5, 1.2, 0],
    steps: (p) => {
      const { s, si, imageX, imageH } = optics(p.lensX, BENCH.objectX, p.focal, BENCH.objectH);
      return [
        {
          label: "Jarak benda ke lensa",
          math: `s = x_lensa − x_benda = ${n(p.lensX)} − (${n(BENCH.objectX, 1)})`,
          value: `${n(s)} m`,
        },
        {
          label: "Rumus lensa tipis dibalik untuk s aksen",
          math: `1/s′ = 1/f − 1/s = 1/${n(p.focal)} − 1/${n(s)}`,
          value: `s′ = ${n(si)} m`,
        },
        {
          label: "Letak bayangan di bangku",
          math: `x′ = x_lensa + s′ = ${n(p.lensX)} + ${n(si)}`,
          value: `${n(imageX)} m`,
        },
        {
          label: "Perbesaran",
          math: `m = −s′ / s = −${n(si)} / ${n(s)}`,
          value: `${n(-si / s)} kali`,
        },
        {
          label: "Tinggi bayangan",
          math: `h′ = m · h = ${n(-si / s)} × ${n(BENCH.objectH, 1)}`,
          value: `${n(imageH)} m${imageH < 0 ? " (terbalik)" : ""}`,
        },
      ];
    },
  },

  kinetics: {
    levelId: "rail-01",
    title: "Gerak Lurus Berubah Beraturan",
    intro:
      "Kereta rel magnetik berangkat dengan kecepatan awal lalu ditambah percepatan tetap sepanjang rel 20 meter.",
    body: [
      "Selama percepatannya tetap, kecepatan akhir bisa dicari tanpa tahu waktunya sama sekali. Yang dibutuhkan cuma kecepatan awal, percepatan, dan jarak.",
      "Perhatikan bahwa kecepatannya dikuadratkan. Menambah percepatan dua kali lipat tidak membuat kecepatan akhir jadi dua kali lipat.",
    ],
    controls: [
      { key: "v0", label: "Kecepatan awal", unit: "m/s", min: 0, max: 10, step: 0.1 },
      { key: "accel", label: "Percepatan", unit: "m/s²", min: 0, max: 5, step: 0.05 },
    ],
    defaults: { v0: 3, accel: 1.5 },
    camera: [0, 8, 26],
    target: [0, 1.4, 0],
    steps: (p) => {
      const s = RAIL.length;
      const v2 = p.v0 ** 2 + 2 * p.accel * s;
      const v = Math.sqrt(v2);
      const t = p.accel > 0 ? (v - p.v0) / p.accel : p.v0 > 0 ? s / p.v0 : Infinity;
      return [
        {
          label: "Kecepatan awal dikuadratkan",
          math: `v₀² = ${n(p.v0)}²`,
          value: `${n(p.v0 ** 2)} m²/s²`,
        },
        {
          label: "Tambahan dari percepatan sepanjang rel",
          math: `2 · a · s = 2 × ${n(p.accel)} × ${s}`,
          value: `${n(2 * p.accel * s)} m²/s²`,
        },
        {
          label: "Kecepatan di ujung rel",
          math: `v = √(v₀² + 2as) = √${n(v2)}`,
          value: `${n(v)} m/s`,
        },
        {
          label: "Lama perjalanan",
          math: p.accel > 0 ? `t = (v − v₀) / a = (${n(v)} − ${n(p.v0)}) / ${n(p.accel)}` : `t = s / v₀`,
          value: `${n(t)} s`,
        },
        {
          label: "Kecepatan rata rata",
          math: `v̄ = s / t = ${s} / ${n(t)}`,
          value: `${n(s / t)} m/s`,
        },
      ];
    },
  },

  drag: {
    levelId: "wind-01",
    title: "Hambatan Udara",
    intro:
      "Udara melawan setiap benda yang menembusnya, dan perlawanannya tumbuh jauh lebih cepat daripada lajunya sendiri.",
    body: [
      "Gaya hambat bergantung pada kuadrat laju. Mobil yang jalannya dua kali lebih cepat menabrak dua kali lebih banyak udara tiap detik, dan menabraknya dua kali lebih keras juga. Dua dikali dua, jadi hambatannya empat kali lipat.",
      "Karena itu tiap mobil punya laju maksimum. Mesin mendorong dengan gaya yang kira kira tetap, hambatan terus tumbuh, dan begitu keduanya sama besar tidak ada lagi sisa gaya untuk mempercepat. Perhatikan dua anak panah di layar: yang hijau tetap, yang merah memanjang sampai sama.",
      "Itu juga sebabnya mobil balap dibuat rendah dan ramping. Menurunkan A dan Cd jauh lebih murah daripada menambah mesin, karena keduanya duduk di dalam akar bersama F.",
    ],
    controls: [
      { key: "thrust", label: "Gaya dorong mesin", unit: "N", min: 100, max: 1600, step: 10 },
      { key: "cd", label: "Koefisien hambat Cd", unit: "", min: 0.2, max: 0.5, step: 0.005 },
      { key: "area", label: "Luas depan A", unit: "m²", min: 1.5, max: 3, step: 0.05 },
    ],
    defaults: { thrust: 600, cd: 0.32, area: 2.2 },
    camera: [-1.5, 4.2, 13],
    target: [-8, 1.2, 0],
    steps: (p) => {
      const ca = p.cd * p.area;
      const slow = dragForce(20, p.cd, p.area);
      const fast = dragForce(40, p.cd, p.area);
      const vmax = topSpeed(p.thrust, p.cd, p.area);
      return [
        {
          label: "Bentuk dan luas digabung jadi satu angka",
          math: `Cd · A = ${n(p.cd, 3)} × ${n(p.area)}`,
          value: `${n(ca, 3)} m²`,
        },
        {
          label: "Hambatan saat melaju 20 m/s",
          math: `F = ½ · ρ · Cd · A · v² = 0.5 × ${AIR} × ${n(ca, 3)} × 20²`,
          value: `${n(slow, 1)} N`,
        },
        {
          label: "Lajunya digandakan jadi 40 m/s",
          math: "v dikuadratkan, jadi hambatannya empat kali lipat",
          value: `${n(fast, 1)} N`,
        },
        {
          label: "Laju maksimum dengan mesin ini",
          math: `v = √(2F / (ρ · Cd · A)) = √(${2 * p.thrust} / ${n(AIR * ca, 3)})`,
          value: `${n(vmax)} m/s atau ${n(vmax * 3.6, 1)} km/jam`,
        },
        {
          label: "Bukti bahwa di situ lajunya berhenti naik",
          math: `hambatan di ${n(vmax)} m/s`,
          value: `${n(dragForce(vmax, p.cd, p.area), 1)} N, sama dengan dorongan mesin`,
        },
      ];
    },
  },

  quantum: {
    levelId: "well-01",
    title: "Interferensi Celah Ganda",
    intro:
      "Cahaya yang lewat dua celah sempit bertemu lagi di layar. Di tempat kedua gelombang sefase hasilnya terang, di tempat keduanya berlawanan hasilnya gelap.",
    body: [
      "Pita terang berjarak sama satu sama lain, dan jaraknya cuma bergantung pada tiga hal: panjang gelombang, jarak layar, dan jarak antar celah.",
      "Layar dimundurkan, pitanya merenggang. Celahnya dirapatkan, pitanya juga merenggang. Cahaya merah berpita lebih lebar daripada cahaya biru karena panjang gelombangnya lebih besar.",
    ],
    controls: [
      { key: "wavelength", label: "Panjang gelombang λ", unit: "nm", min: 400, max: 700, step: 5 },
      { key: "slit", label: "Jarak antar celah d", unit: "mm", min: 0.05, max: 0.5, step: 0.005 },
      { key: "screen", label: "Jarak ke layar L", unit: "m", min: 0.5, max: 3, step: 0.05 },
    ],
    defaults: { wavelength: 550, slit: 0.2, screen: 2 },
    camera: [-4, 9, 26],
    target: [-4, 5, 0],
    steps: (p) => {
      const lam = p.wavelength * 1e-9;
      const d = p.slit * 1e-3;
      const dy = (lam * p.screen) / d;
      return [
        {
          label: "Panjang gelombang dijadikan meter",
          math: `λ = ${p.wavelength} nm × 10⁻⁹`,
          value: `${lam.toExponential(2)} m`,
        },
        {
          label: "Jarak celah dijadikan meter",
          math: `d = ${n(p.slit, 3)} mm × 10⁻³`,
          value: `${d.toExponential(2)} m`,
        },
        {
          label: "Jarak antar pita terang",
          math: `Δy = λ · L / d = ${lam.toExponential(2)} × ${n(p.screen)} / ${d.toExponential(2)}`,
          value: `${n(dy * 1000)} mm`,
        },
        {
          label: `Banyak pita yang muat di layar ${SLIT.screenMm} mm`,
          math: `${SLIT.screenMm} / ${n(dy * 1000)}`,
          value: `${Math.floor(SLIT.screenMm / (dy * 1000))} pita`,
        },
        {
          label: "Sudut pita terang pertama",
          math: "sinθ = λ / d",
          value: `${n((Math.asin(Math.min(1, lam / d)) * 180) / Math.PI, 3)}°`,
        },
      ];
    },
  },

  gravity: {
    levelId: "orbit-02",
    title: "Orbit dan Gravitasi",
    intro:
      "Benda yang dilempar cukup cepat menyamping tidak pernah mendarat. Ia terus jatuh, tapi permukaannya selalu melengkung menjauh secepat jatuhnya.",
    body: [
      "Di jari jari tertentu ada satu kecepatan yang menghasilkan lingkaran sempurna. Lebih lambat dari itu, lintasannya jadi elips yang turun di seberang. Lebih cepat, elipsnya melar menjauh.",
      "Kalau kecepatannya terlalu besar, energinya tidak lagi negatif dan benda itu lepas untuk selamanya.",
    ],
    controls: [
      { key: "radius", label: "Jari jari injeksi", unit: "m", min: 4, max: 10, step: 0.05 },
      { key: "speed", label: "Kecepatan injeksi", unit: "m/s", min: 4, max: 12, step: 0.05 },
    ],
    defaults: { radius: 6, speed: 6 },
    camera: [0, 13, 22],
    target: [0, 9, 0],
    steps: (p) => {
      const vc = circularSpeed(p.radius);
      const energy = p.speed ** 2 / 2 - MU / p.radius;
      const apo = apoapsis(p.radius, p.speed);
      return [
        {
          label: "Kecepatan untuk orbit lingkar di jari jari ini",
          math: `v = √(μ / r) = √(${MU} / ${n(p.radius)})`,
          value: `${n(vc)} m/s`,
        },
        {
          label: "Kecepatan yang kamu pilih",
          math: `v / v_lingkar = ${n(p.speed)} / ${n(vc)}`,
          value:
            p.speed < vc - 0.01
              ? `${n(p.speed / vc)} kali, turun di seberang`
              : p.speed > vc + 0.01
                ? `${n(p.speed / vc)} kali, melar menjauh`
                : "pas, lingkaran",
        },
        {
          label: "Energi tiap satuan massa",
          math: `E = v²/2 − μ/r = ${n(p.speed ** 2 / 2)} − ${n(MU / p.radius)}`,
          value: energy >= 0 ? `${n(energy)}, lepas dari orbit` : `${n(energy)}, masih terikat`,
        },
        {
          label: "Titik terjauh dari pusat",
          math: "r_apo dari energi dan momentum sudut",
          value: `${n(apo)} m`,
        },
        {
          label: "Periode kalau orbitnya lingkar",
          math: `T = 2π · √(r³ / μ) = 2π · √(${n(p.radius ** 3)} / ${MU})`,
          value: `${n(orbitPeriod(p.radius))} s`,
        },
      ];
    },
  },
};
