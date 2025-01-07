/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/app/[map]/topojson": ["./app/[map]/topojson/**/*"]
    }
  }
};

export default nextConfig;
