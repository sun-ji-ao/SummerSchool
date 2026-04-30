import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const enabled = process.env.REDIRECTS_ENABLED === "true";
    if (!enabled) {
      return [];
    }
    return [
      { source: "/why-students-around-the-globe-choose-us", destination: "/why-us", permanent: true },
      { source: "/online-courses-booking-form", destination: "/online-booking", permanent: true },
      { source: "/parents-area", destination: "/parents", permanent: true },
      { source: "/summer-school-locations", destination: "/locations", permanent: true },
    ];
  },
};

export default nextConfig;
