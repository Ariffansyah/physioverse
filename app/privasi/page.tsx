import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Kebijakan Privasi" };

export default function Privasi() {
  return (
    <LegalPage
      eyebrow="Kebijakan privasi"
      title="Yang disimpan, dan yang sengaja tidak"
      standfirst="Daftarnya pendek karena memang sedikit. Semua yang tercatat di bawah ini dipakai untuk menilai misi dan menyusun papan rekor, tidak untuk hal lain."
      clauses={[
        {
          head: "Yang disimpan",
          body: [
            "Email dan kata sandi kamu, dikelola oleh layanan otentikasi Supabase. Kata sandinya disimpan dalam bentuk hash dan tidak pernah terlihat oleh kami.",
            "Nama panggilan pilihanmu.",
            "Satu baris catatan untuk setiap percobaan: misi mana, nilai yang terukur, berhasil atau tidak, lama waktunya, dan kapan dijalankan. Percobaan yang gagal ikut tersimpan, karena itu bagian dari catatan belajarmu.",
          ],
        },
        {
          head: "Yang tidak disimpan",
          body: [
            "Tidak ada alat analitik pihak ketiga, tidak ada piksel pelacak, tidak ada iklan. Halaman ini tidak memuat skrip dari domain lain selain penyedia huruf.",
            "Gerakan kamera, posisi kamu berjalan di dalam ruangan, dan gerakan kursor tidak dikirim ke mana pun. Semuanya berhenti di perambanmu.",
          ],
        },
        {
          head: "Siapa yang bisa melihat apa",
          body: [
            "Catatan percobaanmu hanya bisa dibaca oleh akunmu sendiri. Pembatasannya ditegakkan di tingkat basis data, bukan hanya di tampilan.",
            "Papan rekor hanya mengeluarkan dua hal ke pemain lain: nama panggilan pemegang waktu tercepat per misi, dan waktunya. Nilai, jumlah percobaan, dan email tidak pernah ikut keluar.",
          ],
        },
        {
          head: "Di mana datanya berada",
          body: [
            "Di satu basis data Postgres yang dikelola Supabase. Tidak ada salinan yang dikirim ke layanan lain.",
            "Huruf dimuat dari Google Fonts, yang berarti perambanmu menghubungi server mereka saat halaman dibuka.",
          ],
        },
        {
          head: "Menghapus data",
          body: [
            "Minta lewat kontak yang tercantum dan seluruh isinya dihapus: akun, nama panggilan, dan semua catatan percobaan. Tidak ada arsip yang disimpan setelah itu.",
            "Menghapus akun juga menghapus barisnya di papan rekor, jadi rekor yang kamu pegang akan berpindah ke pemain berikutnya.",
          ],
        },
      ]}
    />
  );
}
