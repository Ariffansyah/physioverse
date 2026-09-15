// node --test lib/sfx.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { CUES, isMuted, setMuted, subscribe } from "./sfx.ts";

// Nadanya dijadwalkan ke jam AudioContext, dan amplopnya pakai ramp
// eksponensial — yang menolak nilai nol. Satu angka nol atau negatif di tabel
// ini bikin nada diam atau melempar, dan itu tidak kelihatan sampai diklik.
test("tiap isyarat punya nada yang bisa dibunyikan", () => {
  for (const [cue, notes] of Object.entries(CUES)) {
    assert.ok(notes.length > 0, `${cue} tidak punya nada`);
    for (const n of notes) {
      assert.ok(n.f >= 20 && n.f <= 20000, `${cue}: ${n.f} Hz di luar jangkauan dengar`);
      assert.ok(n.d > 0, `${cue}: durasi ${n.d} tidak positif`);
      assert.ok(n.t >= 0, `${cue}: offset ${n.t} negatif`);
      const g = n.g ?? 0.6;
      assert.ok(g > 0 && g <= 1, `${cue}: gain ${g} di luar (0, 1]`);
    }
  }
});

test("nada dalam satu isyarat dijadwalkan maju, tidak mundur", () => {
  for (const [cue, notes] of Object.entries(CUES)) {
    for (let i = 1; i < notes.length; i++) {
      assert.ok(notes[i].t >= notes[i - 1].t, `${cue}: nada ${i} mundur dari yang sebelumnya`);
    }
  }
});

test("di server bunyinya selalu mati — tidak ada localStorage untuk dibaca", () => {
  assert.equal(isMuted(), false);
});

test("setMuted memberi tahu pelanggannya", () => {
  let hits = 0;
  const stop = subscribe(() => hits++);
  setMuted(true);
  setMuted(false);
  assert.equal(hits, 2);
  stop();
  setMuted(true);
  assert.equal(hits, 2, "pelanggan yang berhenti masih dipanggil");
});
