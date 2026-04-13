/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes moved out of `experimental` in recent Next.js versions.
  typedRoutes: false,
  // Silence turbopack root warning when another lockfile exists higher up.
  // Use process.cwd() to avoid __dirname in ESM.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
