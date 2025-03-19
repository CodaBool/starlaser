/** @type {import('next').NextConfig} */
import path from "path"


const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/v1:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
          { key: "Access-Control-Allow-Headers", value: "Accept, Accept-Version, Content-Length, Content-Type" },
        ]
      }
    ]
  },


  reactStrictMode: false,
  experimental: {
    // outputFileTracingRoot: path.join(__dirname),
    outputFileTracingIncludes: {
      "/app/[map]/topojson": ["./app/[map]/topojson/**/*"]
    }
  }
};

export default nextConfig;
