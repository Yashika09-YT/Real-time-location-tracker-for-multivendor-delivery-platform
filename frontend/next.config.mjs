/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // If using Leaflet images directly from node_modules, may need to configure webpack
  // For now, assuming CSS handles image paths or they are in public.
};

export default nextConfig;