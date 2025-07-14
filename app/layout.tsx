import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IFlytics - Your Advanced Flight Data Analytics Companion for Infinite Flight",
  description: "Track and analyze your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games. Join thousands of pilots exploring their aviation data.",
  keywords: "infinite flight, flight tracking, aviation analytics, pilot statistics, flight data, expert server, flight simulator, aviation dashboard, pilot leaderboards, flight history",
  authors: [{ name: "IFlytics Team" }],
  creator: "IFlytics",
  publisher: "IFlytics",
  metadataBase: new URL('https://iflytics.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'IFlytics - Advanced Flight Data Analytics for Infinite Flight',
    description: 'Track and analyze your Infinite Flight statistics with advanced data visualization, real-time flight maps, leaderboards, and interactive games.',
    siteName: 'IFlytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IFlytics - Advanced Flight Data Analytics for Infinite Flight',
    description: 'Track and analyze your Infinite Flight statistics with advanced data visualization, real-time flight maps, and interactive games.',
    creator: '@iflytics',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FAF0E6]`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
          <Analytics />
      </body>
    </html>
  );
}
