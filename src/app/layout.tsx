import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme-provider";
import StructuredData from './components/structured-data'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'YouTube Transcript Extractor - Download Free Transcripts & Captions',
  description: 'Extract YouTube transcripts instantly. Download from single videos, bulk extract up to 500 transcripts, get channel transcripts, or upload CSV. Free single extracts, premium bulk features with AI summary.',
  keywords: [
    'youtube transcript',
    'youtube transcript extractor',
    'download youtube transcript',
    'youtube captions download',
    'bulk youtube transcripts',
    'youtube channel transcripts',
    'youtube transcript csv',
    'youtube subtitle extractor',
    'transcript summary',
    'youtube video to text'
  ],
  openGraph: {
    title: 'YouTube Transcript Extractor - Free & Bulk Download',
    description: 'Extract YouTube transcripts from single videos, bulk process up to 500 videos, or get entire channel transcripts. Free for single videos, premium bulk features.',
    url: 'https://get-youtube-transcripts.io',
    siteName: 'Get YouTube Transcripts',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YouTube Transcript Extractor',
    description: 'Extract YouTube transcripts - Free single downloads, bulk extract, channel transcripts & CSV upload',
  },
  alternates: {
    canonical: 'https://get-youtube-transcripts.io',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        
        {/* Add Structured Data for SEO */}
        <StructuredData />
      </body>
    </html>
  );
}