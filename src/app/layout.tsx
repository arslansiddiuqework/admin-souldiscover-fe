import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "material-symbols/outlined.css";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ConnectedParticlesBackground } from "@/components/ui/connected-particles-background";
import {
  BRAND_CAPTION,
  BRAND_DESCRIPTION,
  BRAND_ICON_SRC,
  BRAND_NAME,
  BRAND_TITLE,
} from "@/lib/branding";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: BRAND_TITLE,
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  appleWebApp: {
    title: BRAND_NAME,
    capable: true,
    statusBarStyle: "black-translucent",
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
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/icon.png?v=3", type: "image/png", sizes: "512x512" },
      { url: `${BRAND_ICON_SRC}?v=3`, type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png?v=3", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico?v=3",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0614",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased atmosphere-base text-foreground`}>
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
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
