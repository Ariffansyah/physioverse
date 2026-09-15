import LegalPage from "@/components/LegalPage";
import { CHAMBERS, LEVELS } from "@/lib/levels";

export const metadata = {
  title: "Tentang PhysioVerse",
  description:
    "Laboratorium fisika 3D untuk anak SMA: belajar lewat simulasi yang bisa diatur, lalu uji hitunganmu sendiri lewat misi.",
};

const rooms = Object.keys(CHAMBERS).length;

export default function About() {
  return (
    <LegalPage
      chip="Tentang"
      eyebrow="Tentang"
      title="Apa itu PhysioVerse"
      standfirst="Laboratorium fisika 3D untuk anak SMA. Dibuat supaya rumus yang biasanya cuma berbentuk tulisan di papan tulis bisa kamu lihat bentuknya, kamu geser angkanya, dan kamu lihat akibatnya."
      clauses={[
        {
          head: "Dua cara memakainya",
          body: [
            `Mode belajar terbuka tanpa akun. Kamu memilih salah satu dari ${rooms} ruang, menggeser kenopnya, dan simulasi 3D-nya langsung berjalan ulang. Di sebelahnya, hitungannya ditulis baris demi baris memakai angka yang barusan kamu pilih, sampai ketemu jawabannya.`,
            "Mode misi kebalikannya. Alatnya diberikan, rumusnya diberikan, angkanya tidak. Kamu yang menghitung, lalu alat yang menilai apakah jawabanmu cocok dengan yang terjadi di ruangan.",
          ],
        },
        {
          head: "Kenapa dibuat begini",
          body: [
            "Rumus gampang dihafal dan susah dibayangkan. Kalau sudut tembak dinaikkan, apanya yang berubah, dan kenapa jarak terjauh selalu jatuh di 45 derajat?",
            "Menggeser satu kenop lalu melihat lintasannya berubah menjawab pertanyaan itu lebih cepat daripada satu halaman penjelasan. Angkanya tetap ditampilkan supaya kamu tahu itu bukan animasi karangan, melainkan rumus yang sama dengan yang ada di bukumu.",
          ],
        },
        {
          head: "Apa saja yang ada di dalam",
          body: [
            `Ada ${rooms} ruang uji dan ${LEVELS.length} misi: gerak parabola, lemparan bola basket, lensa cembung, gerak lurus berubah beraturan, hambatan udara pada mobil, interferensi celah ganda, dan orbit.`,
            "Urutannya cuma saran. Semua ruang terbuka sejak awal, jadi kamu boleh langsung ke bab yang sedang dipelajari di kelas.",
          ],
        },
        {
          head: "Batas yang perlu kamu tahu",
          body: [
            "Semua simulasinya memakai model ideal: tanpa hambatan udara, lensa dianggap tipis, percepatan gravitasi dianggap tetap. Angka yang keluar benar untuk model itu, bukan untuk dunia nyata yang punya gesekan dan aberasi.",
            "Pakai ini sebagai alat latihan, bukan sebagai rujukan pengukuran, dan bukan pengganti praktikum di laboratorium sungguhan.",
          ],
        },
        {
          head: "Akun dan data",
          body: [
            "Mode belajar tidak meminta apa apa. Akun baru diperlukan kalau kamu mau mengerjakan misi, karena waktu pengerjaan, XP, dan papan rekor perlu tempat menyimpan.",
            "Nama panggilan yang tampil di papan rekor kamu yang pilih sendiri, jadi tidak perlu memakai nama asli. Rinciannya ada di halaman privasi.",
          ],
        },
      ]}
    />
  );
}
