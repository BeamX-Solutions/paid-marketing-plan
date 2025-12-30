import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BeamX Solutions - AI-Powered Marketing Plan Generator",
  description: "Generate comprehensive marketing plans in minutes with Claude AI. Create your personalized marketing strategy using our proven 9-square framework.",
  keywords: "marketing plan, AI marketing, business strategy, Claude AI, marketing automation, small business marketing",
  authors: [{ name: "BeamX Solutions" }],
  creator: "BeamX Solutions",
  publisher: "BeamX Solutions",
  openGraph: {
    title: "BeamX Solutions - AI-Powered Marketing Plan Generator",
    description: "Generate comprehensive marketing plans in minutes with Claude AI",
    url: "https://www.beamxsolutions.com",
    siteName: "BeamX Solutions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeamX Solutions - AI-Powered Marketing Plan Generator",
    description: "Generate comprehensive marketing plans in minutes with Claude AI",
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
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
