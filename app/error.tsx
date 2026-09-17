"use client";

import Stop from "@/components/Stop";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <Stop
      chip="Galat"
      code={error.digest ? `Galat · ${error.digest}` : "Galat"}
      title="Instrumennya berhenti di tengah jalan"
      body="Permintaan terakhir gagal diselesaikan. Coba ulangi sekali lagi. Kalau masih berhenti di tempat yang sama, kirimkan kode di atas ke arppwork@gmail.com."
      action={
        <button type="button" onClick={() => retry()} className="btn btn-hot">
          Coba lagi
        </button>
      }
    />
  );
}
