import path from "node:path";

export const dynamic = "force-static";

const repoName =
  process.env.NEXT_PUBLIC_REPO_NAME ||
  process.env.GITHUB_REPOSITORY?.split("/")?.[1] ||
  path.basename(process.cwd());

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? `/${repoName}` : "";

export default function manifest() {
  return {
    name: "GlowUp Gym & Food Tracker",
    short_name: "GlowUp",
    id: `${basePath}/`,
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    background_color: "#fff8f0",
    theme_color: "#ffb7a2",
    orientation: "portrait-primary",
    icons: [
      {
        src: `${basePath}/icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: `${basePath}/icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
      {
        src: `${basePath}/bench_press.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
