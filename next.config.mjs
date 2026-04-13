import path from "node:path";

const repoName =
  process.env.NEXT_PUBLIC_REPO_NAME ||
  process.env.GITHUB_REPOSITORY?.split("/")?.[1] ||
  path.basename(process.cwd());

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? `/${repoName}` : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // typedRoutes moved out of `experimental` in recent Next.js versions.
  typedRoutes: false,
  // Silence turbopack root warning when another lockfile exists higher up.
  // Use process.cwd() to avoid __dirname in ESM.
  turbopack: {
    root: process.cwd(),
  },
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: {
    unoptimized: true, // required for static export
  },
};

export default nextConfig;
