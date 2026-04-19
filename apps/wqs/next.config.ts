import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    allowedDevOrigins: ['http://localhost:3000', 'https://wqs-client.vercel.app/']
};

export default nextConfig;