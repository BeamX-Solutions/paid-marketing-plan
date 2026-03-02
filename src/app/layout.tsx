import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

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
      { url: "/logo-white.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo-white.png", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome", url: "/logo-white.png" },
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
      <head>
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
            gtag('config', 'G-F9QMSMREGP', {
              page_path: window.location.pathname,
              send_page_view: true
            });
          `}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <AuthSessionProvider>
          <Suspense fallback={null}>
            <GoogleAnalytics />
          </Suspense>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
