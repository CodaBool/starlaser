/** @type {import('next').NextConfig} */
import path from "path"


const nextConfig = {
  experimental: {
    nftTracing: true,
    // outputFileTracingRoot: path.join(__dirname),
    outputFileTracingIncludes: {
      "/app/[map]/topojson": ["./app/[map]/topojson/**/*"]
    }
  }
};

export default nextConfig;
