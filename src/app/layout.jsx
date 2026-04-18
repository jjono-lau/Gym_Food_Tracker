import "./globals.css";
import { Nunito, Poppins } from "next/font/google";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/gym_girl.svg", type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: "/gym_girl.svg", type: "image/svg+xml" }],
    shortcut: ["/gym_girl.svg"],
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
      <body className="min-h-full bg-cream text-ink antialiased">{children}</body>
    </html>
  );
}
