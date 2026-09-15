import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// Tiga suara: jurnal ilmiah, catatan teknisi, dan angka.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  // Hanya bobot yang benar-benar dipakai: 200 untuk judul, 300 untuk sisanya.
  weight: ["200", "300"],
  style: ["normal", "italic"],
});
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400"],
});
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "PhysioVerse: Into the Physics Verse",
  description:
    "Laboratorium fisika orang pertama. Atur instrumennya, hitung sendiri jawabannya, lalu lihat apakah alam sepakat.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Langit dipasang sekali di sini: tiap halaman mewarisi nebula dan
            pita galaksi yang sama tanpa harus memasangnya sendiri. */}
        <div aria-hidden="true" className="cosmos">
          <span className="sky" />
        </div>
        {children}
      </body>
    </html>
  );
}
