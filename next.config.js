/** @type {import('next').NextConfig} */
import path from "path"


const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/v1:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  },


  // reactStrictMode: false,
  // experimental: {
  //   // outputFileTracingRoot: path.join(__dirname),
  //   outputFileTracingIncludes: {
  //     "/app/[map]/topojson": ["./app/[map]/topojson/**/*"]
  //   }
  // }
};

export default nextConfig;
