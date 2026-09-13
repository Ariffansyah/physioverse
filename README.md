# PhysioVerse: Into the Physics Verse

Game fisika orang pertama. Masuk ke fasilitas uji, jalan sendiri ke konsol kendali,
atur parameter, lalu saksikan hasilnya dari mata kepala sendiri.

Next.js 16 (App Router) · Tailwind v4 · Supabase · React Three Fiber + postprocessing.

## Menjalankan

1. **Database sudah pernah diisi skema v1?** Jalankan `supabase/migrations/0002_singleplayer.sql`
   di SQL Editor. **Project baru?** Jalankan `supabase/schema.sql` saja.
2. Authentication → Providers → Email: matikan **Confirm email**.
3. `cp .env.example .env.local`, isi URL + anon/publishable key.
4. `pnpm install && pnpm dev` → http://localhost:3000

Daftar satu akun (callsign + email + password), lalu langsung main. Tidak ada guru,
tidak ada PIN — semua level sudah ada di dalam game.

## Kontrol

`W A S D` jalan · `SHIFT` lari · mouse melihat · `E` buka konsol (harus dekat meja) ·
`ESC` lepas kursor.

## Struktur

```
lib/physics.ts           rumus murni (lensa tipis, parabola, GLBB)
lib/levels.ts            katalog 6 misi: kontrol, target, toleransi, XP
app/play/                pilih misi (progres, XP, rekor) + halaman main
app/play/actions.ts      mencatat percobaan; nilai dihitung ulang di server
components/game/
  Game.tsx               state mesin permainan + overlay
  Hud.tsx                crosshair, kartu misi, telemetri, konsol, hasil
  World.tsx              Canvas, cahaya, bloom, pointer lock
  Player.tsx             kontroler orang pertama (tanpa engine fisika)
  Room.tsx               aula, dinding, strip neon, meja konsol
  chambers/              ballistics · photonics · kinetics
```

## Menambah misi atau ruangan

Misi baru di ruangan yang sudah ada: tambah satu entri di `LEVELS` (`lib/levels.ts`).
Ruangan baru: satu file di `components/game/chambers/` + satu baris di `VIEWS`
(`components/game/World.tsx`) + satu entri di `CHAMBERS`.

Tes ikut memastikan tiap level benar-benar bisa diselesaikan dengan slider yang ada,
dan tidak lolos hanya dengan nilai default:

```bash
node --test lib/physics.test.ts lib/levels.test.ts
```

## Catatan keamanan

- `finishRun` menghitung ulang nilai dari parameter konsol pakai `level.solve` yang sama,
  lalu menilai sendiri. Mengarang `solved` dari devtools tidak berpengaruh.
- `sanitizeParams` menjepit tiap parameter ke rentang slidernya sebelum dinilai.
- RLS: pemain hanya bisa membaca dan menulis run miliknya sendiri. Papan rekor lewat
  view `leaderboard` yang cuma mengeluarkan callsign + waktu.
