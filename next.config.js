/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.oppo.com",
        port: "",
        pathname: "/**", // allow any path
      },
    ],
  },
};

module.exports = nextConfig;
