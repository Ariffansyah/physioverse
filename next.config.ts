import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Situs berjalan di subdomain arpthef.my.id. Next membandingkan header
  // `Origin` dengan host aplikasi sendiri dan menolak Server Action kalau
  // berbeda — proxy yang tidak meneruskan `x-forwarded-host` bikin login dan
  // form admin ditolak tanpa daftar ini. Dev server perlu daftarnya terpisah.
  allowedDevOrigins: ["*.arpthef.my.id"],
  experimental: {
    serverActions: { allowedOrigins: ["*.arpthef.my.id"] },
  },
};

export default nextConfig;
