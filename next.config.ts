import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Fix para leaflet-draw en Next.js
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  // Asegurar que leaflet-draw se cargue correctamente
  transpilePackages: ['leaflet-draw'],
};

export default nextConfig;
