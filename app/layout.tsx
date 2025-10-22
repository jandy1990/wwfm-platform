import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/templates/Header/Header";
import Footer from "@/components/organisms/Footer";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import { PointsContainer } from "@/components/points/PointsContainer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WWFM Platform",
  description: "What Worked For Me - Find solutions that actually work",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Header />
        <main>
          {children}
        </main>
        <Footer />
        <FeedbackWidget />
        <PointsContainer />
      </body>
    </html>
  );
}