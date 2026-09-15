/** Kerangka /play: tiga kueri Supabase sebelum daftar misi bisa digambar.
    Bentuknya mengikuti kartu misi aslinya — garis rambut yang meredum, bukan
    balok abu berkilau. */
export default function Loading() {
  return (
    <main className="relative z-2 mx-auto w-full max-w-[1480px] flex-1 px-6 py-12 sm:px-10 lg:px-16">
      <div className="grid gap-5 border-b border-rule pb-6">
        <p className="tag">Membaca catatan percobaan</p>
        <span className="breathe h-px w-64 max-w-full bg-rule" />
      </div>

      {[0, 1].map((s) => (
        <section key={s} className="pt-12">
          <span
            className="breathe block h-px w-48 bg-rule"
            style={{ animationDelay: `${s * 0.3}s` }}
          />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((c) => (
              <li key={c} className="hud grid gap-4 p-5">
                {[0, 1, 2].map((r) => (
                  <span
                    key={r}
                    className="breathe h-px bg-rule"
                    style={{
                      width: `${[70, 96, 48][r]}%`,
                      animationDelay: `${s * 0.3 + c * 0.12 + r * 0.1}s`,
                    }}
                  />
                ))}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
