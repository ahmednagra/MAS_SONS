import type { NextConfig } from "next";

// Deployed: the backend's PUBLIC_BASE_URL is the site origin itself (nginx routes /uploads/ to
// FastAPI), so unit photos come from https://<site>/uploads/** — allow exactly that origin.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : null;
const siteUploads = siteUrl && siteUrl.hostname !== "localhost"
  ? [{ protocol: siteUrl.protocol.replace(":", "") as "http" | "https", hostname: siteUrl.hostname, pathname: "/uploads/**" }]
  : [];

const nextConfig: NextConfig = {
  cacheComponents: true, // Cache Components + PPR — see docs/RENDERING_AND_SEO_GUIDE.md
  images: {
    remotePatterns: [
      ...siteUploads,
      // TODO: point this at the real storage/CDN host once provisioned.
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
      // Local storage provider (Backend PUBLIC_BASE_URL) — unit photos and auction sheets
      // uploaded through /admin/stock/{id}/images or scripts/import_unit_media.py.
      { protocol: "http", hostname: "localhost", port: "8000", pathname: "/uploads/**" },
      // Seed unit photos (app/Utils/dictionaries/unit_images.py) — the real source
      // hostnames from the Autotrader/CarGurus/CommercialTruckTrader listings.
      { protocol: "https", hostname: "assets.cai-media-management.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn-media.tilabs.io", pathname: "/**" },
      { protocol: "https", hostname: "images.autotrader.com", pathname: "/**" },
      { protocol: "https", hostname: "static.cargurus.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
