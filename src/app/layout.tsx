import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConnectedParticlesBackground } from "@/components/ui/connected-particles-background";
import {
  BRAND_ASSET_VERSION,
  BRAND_CAPTION,
  BRAND_DESCRIPTION,
  BRAND_ICON_SRC,
  BRAND_NAME,
  BRAND_TITLE,
} from "@/lib/branding";

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"),
  title: BRAND_TITLE,
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  appleWebApp: {
    title: BRAND_NAME,
    capable: true,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    siteName: BRAND_NAME,
    title: BRAND_TITLE,
    description: BRAND_CAPTION,
    images: [{ url: BRAND_ICON_SRC, alt: BRAND_NAME }],
  },
  twitter: {
    card: "summary",
    title: BRAND_TITLE,
    description: BRAND_CAPTION,
    images: [BRAND_ICON_SRC],
  },
  icons: {
    icon: [
      { url: `/favicon.ico?v=${BRAND_ASSET_VERSION}`, sizes: "any" },
      { url: `/favicon-32x32.png?v=${BRAND_ASSET_VERSION}`, type: "image/png", sizes: "32x32" },
      { url: `/favicon-16x16.png?v=${BRAND_ASSET_VERSION}`, type: "image/png", sizes: "16x16" },
      { url: `/icon.png?v=${BRAND_ASSET_VERSION}`, type: "image/png", sizes: "512x512" },
      { url: `${BRAND_ICON_SRC}?v=${BRAND_ASSET_VERSION}`, type: "image/png" },
    ],
    apple: [{ url: `/apple-icon.png?v=${BRAND_ASSET_VERSION}`, sizes: "180x180", type: "image/png" }],
    shortcut: `/favicon.ico?v=${BRAND_ASSET_VERSION}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#FBF9FF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${quicksand.variable} antialiased atmosphere-base text-foreground font-sans`}>
        {/* Soft particle wash only — full pastel landscape is reserved for auth screens */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-70" aria-hidden>
          <ConnectedParticlesBackground />
        </div>
        <div className="relative z-10">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
