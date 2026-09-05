import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true, // Cache Components + PPR — see docs/RENDERING_AND_SEO_GUIDE.md
  images: {
    remotePatterns: [
      // TODO: point this at the real storage/CDN host once provisioned.
      { protocol: "https", hostname: "storage.googleapis.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
