import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "BeamX Luna | AI-Powered Marketing Tool",
  description: "Generate comprehensive marketing plans in minutes with BeamX Luna. Create your personalized marketing strategy using our proven framework.",
  keywords: "marketing plan, AI marketing, business strategy, BeamX Luna, marketing automation, small business marketing, marketing strategy generator",
  authors: [{ name: "BeamX Solutions" }],
  creator: "BeamX Solutions",
  publisher: "BeamX Solutions",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/android-chrome-192x192.png", sizes: "192x192" },
      { rel: "android-chrome", url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "BeamX Luna | AI-Powered Marketing Tool",
    description: "Generate comprehensive marketing plans in minutes with BeamX Luna. Create your personalized marketing strategy.",
    url: "https://beamxsolutions.com",
    siteName: "BeamX Solutions",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "BeamX Solutions - AI Marketing Plan Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BeamX Luna | AI-Powered Marketing Tool",
    description: "Generate comprehensive marketing plans in minutes with BeamX Luna",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F9QMSMREGP"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F9QMSMREGP');
          `}
        </Script>

        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
