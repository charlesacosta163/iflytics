import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes";
import { redirect } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolageGrotesque = Bricolage_Grotesque({ 
  weight: ['400', '500', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bricolage',
});

export const metadata: Metadata = {
  title: "IFlytics - Your Advanced Flight Stats Companion for Infinite Flight",
  description: "Built on top of IF\'s existing grading system, track and analyze your Infinite Flight statistics with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of pilots exploring their Infinite Flight data.",
  keywords: "infinite flight, flight tracking, analytics, flight, aviation, pilot, stats, data, expert server, flight simulator, dashboard, flight history, airbus, boeing, leaderboard",
  authors: [{ name: "IFlytics Team" }],
  creator: "IFlytics",
  publisher: "IFlytics",
  metadataBase: new URL('https://iflytics.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'IFlytics -  Your Advanced Flight Stats Companion for Infinite Flight',
    description: 'Built on top of IF\'s existing grading system, track and analyze your Infinite Flight statistics with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of users exploring their Infinite Flight data.',
    siteName: 'IFlytics',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IFlytics - Your Advanced Flight Stats Companion for Infinite Flight',
    description: 'Built on top of IF\'s existing grading system, track and analyze your Infinite Flight statistics with advanced data visualization, thorough analysis of your favorite routes and aircraft, flight history, map tracker, and more! Join thousands of users exploring their Infinite Flight data.',
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

  const inMaintenance = false;

    if (inMaintenance) {
        return (
            <div className="h-screen flex">
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h1 className="text-4xl font-bold">Maintenance Mode</h1>
                    <p className="text-lg text-gray-600">We are currently performing maintenance on the IFlytics platform. Please check back later.</p>
                </div>
            </div>
        );
    }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
      </head>
      <body
        className={`${bricolageGrotesque.className} ${geistSans.variable} ${geistMono.variable} antialiased dark:bg-gray-950 bg-[#FAF0E6]`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
          <Analytics />
      </body>
    </html>
  );
}
