import Stop from "@/components/Stop";

export default function NotFound() {
  return (
    <Stop
      chip="404"
      code="404"
      title="Ruang ini tidak ada di peta"
      body="Alamatnya salah ketik, atau halamannya memang sudah tidak dipakai lagi. Semua ruang uji masih bisa dibuka dari tiga pintu di bawah ini."
    />
  );
}
