import "./globals.css";
import { Nunito, Poppins } from "next/font/google";
import path from "node:path";
import ChatbotProvider from "@/components/ChatbotProvider";
import MotionProvider from "@/components/MotionProvider";

const repoName =
  process.env.NEXT_PUBLIC_REPO_NAME ||
  process.env.GITHUB_REPOSITORY?.split("/")?.[1] ||
  path.basename(process.cwd());

const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? `/${repoName}` : "";
const scriptSrc = isProd
  ? "script-src 'self' 'unsafe-inline'"
  : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";
const csp = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const heading = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Girlboss Mode",
  description:
    "Beginner-friendly workouts, triglyceride-conscious South Indian meals, and playful progress tracking.",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/icon-192.png`, type: "image/png", sizes: "192x192" },
      { url: `${basePath}/bench_press.svg`, type: "image/svg+xml", sizes: "any" },
    ],
    apple: [
      { url: `${basePath}/apple-touch-icon.png`, type: "image/png", sizes: "180x180" },
    ],
    shortcut: [`${basePath}/icon-192.png`],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "GlowUp",
  },
};

// Next.js expects viewport-related settings here (not inside metadata).
export const viewport = {
  themeColor: "#ffb7a2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable} h-full`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={csp} />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-full bg-cream text-ink antialiased">
        <MotionProvider>
          <ChatbotProvider>{children}</ChatbotProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
