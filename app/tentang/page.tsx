import LegalPage from "@/components/LegalPage";
import { CHAMBERS, LEVELS } from "@/lib/levels";

export const metadata = {
  title: "Tentang",
  description:
    "PhysioVerse adalah laboratorium fisika 3D untuk anak SMA: belajar lewat simulasi yang bisa diatur, lalu uji hitunganmu sendiri lewat misi.",
};

const rooms = Object.keys(CHAMBERS).length;

export default function About() {
  return (
    <LegalPage
      chip="Tentang"
      eyebrow="Tentang"
      title="Apa itu PhysioVerse?"
      standfirst="PhysioVerse adalah laboratorium fisika 3D untuk anak SMA. Dibuat supaya rumus yang biasanya cuma berbentuk tulisan di papan tulis bisa kamu lihat bentuknya, kamu geser angkanya, dan kamu lihat akibatnya."
      clauses={[
        {
          head: "Dua cara memakainya",
          body: [
            `Mode belajar terbuka tanpa akun. Kamu memilih salah satu dari ${rooms} ruang, menggeser kenopnya, dan simulasi 3D-nya langsung berjalan ulang. Di sebelahnya, hitungannya ditulis baris demi baris memakai angka yang barusan kamu pilih, sampai ketemu jawabannya.`,
            "Mode misi kebalikannya. Alatnya diberikan, rumusnya diberikan, angkanya tidak. Kamu yang menghitung, lalu alat yang menilai apakah jawabanmu cocok dengan yang terjadi di ruangan.",
          ],
        },
        {
          head: "Antara hafalan dan pemahaman",
          body: [
            "Selama ini kita mungkin hafal rumusnya, tapi kesulitan membayangkan bentuk aslinya. Saat sudut tembak diubah, variabel apa yang paling berdampak? Kenapa jarak maksimal selalu berada di 45 derajat?",
            "Daripada membaca satu halaman buku, geser saja kenopnya dan saksikan lintasannya langsung. Angka aslinya tetap dimunculkan—membuktikan bahwa ini fisika sungguhan, bukan sekadar animasi tebakan.",
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
            "Semua simulasi memakai model ideal: tanpa hambatan udara, lensa dianggap tipis, percepatan gravitasi dianggap tetap. Angka yang keluar benar untuk model itu, bukan untuk dunia nyata yang punya gesekan dan aberasi.",
            "Pakai ini sebagai alat latihan, bukan sebagai rujukan pengukuran, dan bukan pengganti praktikum di laboratorium sungguhan.",
          ],
        },
        {
          head: "Akun dan data",
          body: [
            "Mode belajar tidak memerlukan akun. Akun baru diperlukan kalau kamu ingin mengerjakan misi, karena waktu pengerjaan, XP, dan papan rekor perlu tempat menyimpan.",
            "Nama panggilan yang tampil di papan rekor kamu yang pilih sendiri, jadi tidak perlu memakai nama asli. Rinciannya ada di halaman privasi.",
          ],
        },
      ]}
    />
  );
}
