import LegalPage from "@/components/LegalPage";
import { CHAMBERS, LEVELS } from "@/lib/levels";

const rooms = Object.keys(CHAMBERS).length;

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
            "Nama panggilan adalah satu-satunya tulisanmu yang terbaca pengunjung lain. Kalau isinya kasar atau menyamar jadi orang lain, pengelola menggantinya dengan nama netral tanpa menghapus akun dan kemajuanmu.",
          ],
        },
        {
          head: "Apa yang disediakan",
          body: [
            `${LEVELS.length} misi di ${rooms} ruang uji, terbuka penuh tanpa biaya dan tanpa tingkat berbayar. Tidak ada fitur yang dikunci, karena mengunci ruang uji berarti mengunci pelajarannya.`,
            "Semua misi terbuka sejak awal. Urutannya cuma saran, bukan gerbang, jadi kamu boleh langsung ke ruang mana pun.",
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
            "Akun yang tetap melanggar bisa dibekukan pengelola: misinya tidak bisa dibuka dan catatannya hilang dari papan rekor. Datanya tidak dihapus, jadi pembekuan bisa dibatalkan kalau memang keliru.",
          ],
        },
        {
          head: "Kode sumber dan lisensi",
          body: [
            "Seluruh kode situs ini terbuka di bawah Lisensi MIT. Kamu boleh membacanya, menyalinnya, mengubahnya, dan memakainya di kelasmu sendiri, asal pemberitahuan hak cipta dan teks lisensinya ikut dibawa.",
            "Lisensi itu menyangkut kodenya. Akun, catatan percobaan, dan papan rekor tetap milik pemainnya masing-masing dan tidak ikut dilisensikan.",
            "Pertanyaan soal ketentuan ini, laporan penyalahgunaan, dan keberatan atas tindakan pengelola dikirim ke arppwork@gmail.com.",
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
