import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Ketentuan Layanan" };

export default function Ketentuan() {
  return (
    <LegalPage
      eyebrow="Ketentuan layanan"
      title="Apa yang kamu setujui saat membuat akun"
      standfirst="Ditulis dalam bahasa biasa. Kalau ada bagian yang terasa tidak jelas, itu kesalahan kami, bukan kamu."
      clauses={[
        {
          head: "Akun dan nama panggilan",
          body: [
            "Satu akun berisi email, kata sandi, dan satu nama panggilan. Nama panggilan tampil di papan rekor, jadi jangan pakai nama asli kalau kamu tidak mau terlihat orang lain.",
            "Kalau nama panggilan yang kamu pilih sudah dipakai, sistem menambahkan angka di belakangnya dan pendaftaran tetap berhasil.",
          ],
        },
        {
          head: "Apa yang disediakan",
          body: [
            "Delapan belas misi di enam ruang uji, terbuka penuh tanpa biaya dan tanpa tingkat berbayar. Tidak ada fitur yang dikunci, karena mengunci ruang uji berarti mengunci pelajarannya.",
            "Semua misi terbuka sejak awal. Urutannya cuma saran, bukan gerbang — kamu boleh langsung ke ruang mana pun.",
          ],
        },
        {
          head: "Batas keakuratan",
          body: [
            "Simulasinya memakai model ideal: tanpa hambatan udara, lensa tipis, percepatan tetap. Angka yang keluar benar untuk model itu, bukan untuk dunia nyata dengan gesekan dan aberasi.",
            "Gunakan sebagai alat latihan, bukan sebagai rujukan pengukuran. Hasil di sini tidak menggantikan praktikum di laboratorium sungguhan.",
          ],
        },
        {
          head: "Penggunaan yang wajar",
          body: [
            "Silakan memakai, mempelajari, dan membicarakan hasilnya. Jangan menjalankan skrip otomatis untuk mengisi papan rekor, dan jangan mencoba menulis catatan percobaan atas nama pemain lain.",
            "Penilaian dihitung ulang di server dari parameter konsolmu, jadi mengubah nilai lewat peramban tidak mengubah apa pun kecuali membuang waktumu.",
          ],
        },
        {
          head: "Perubahan ketentuan",
          body: [
            "Kalau ketentuan ini berubah, versi barunya tayang di halaman yang sama dan tanggal perubahannya dicantumkan di sini. Perubahan yang mempengaruhi data pemain diberitahukan lewat email.",
          ],
        },
      ]}
    />
  );
}
