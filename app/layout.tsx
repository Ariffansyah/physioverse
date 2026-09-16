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

const site =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const description =
  "Laboratorium fisika 3D untuk anak SMA. Geser instrumennya di mode belajar, " +
  "lalu uji hitunganmu sendiri lewat 21 misi di 7 ruang uji.";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "PhysioVerse: Into the Physics Verse",
    template: "%s · PhysioVerse",
  },
  description,
  applicationName: "PhysioVerse",
  authors: [{ name: "Ariffansyah" }, { name: "Nailah Kusnadi" }],
  category: "education",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "PhysioVerse",
    title: "PhysioVerse: Into the Physics Verse",
    description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
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
