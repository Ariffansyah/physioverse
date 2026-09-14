/** Kerangka /play: tiga kueri Supabase sebelum daftar misi bisa digambar.
    Bentuknya mengikuti halaman aslinya — garis rambut yang meredup, bukan
    balok abu berkilau. */
export default function Loading() {
  return (
    <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-16 sm:px-10 lg:px-16">
      <section className="grid gap-10 border-b border-rule pb-12 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-end">
        <div className="grid gap-5">
          <p className="tag">Membaca catatan percobaan</p>
          <span className="breathe h-px w-64 max-w-full bg-rule" />
          <span className="breathe h-px w-96 max-w-full bg-rule [animation-delay:0.4s]" />
        </div>
        <span className="breathe h-px w-full bg-rule [animation-delay:0.8s]" />
      </section>

      {[0, 1, 2].map((s) => (
        <section key={s} className="pt-14">
          <span className="breathe block h-px w-48 bg-rule" style={{ animationDelay: `${s * 0.3}s` }} />
          <ul className="mt-7 border-t border-rule">
            {[0, 1].map((r) => (
              <li key={r} className="grid gap-3 border-b border-rule py-6">
                <span
                  className="breathe h-px w-2/3 bg-rule"
                  style={{ animationDelay: `${s * 0.3 + r * 0.15}s` }}
                />
                <span
                  className="breathe h-px w-1/3 bg-rule"
                  style={{ animationDelay: `${s * 0.3 + r * 0.15 + 0.2}s` }}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
