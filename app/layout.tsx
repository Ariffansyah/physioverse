import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";


const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],

  weight: ["300", "400"],
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


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#080e1a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">


        <div aria-hidden="true" className="cosmos">
          <span className="sky" />
        </div>
        {children}
      </body>
    </html>
  );
}
