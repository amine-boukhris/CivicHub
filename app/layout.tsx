import type React from "react";
import type { Metadata } from "next";
import { Recursive, Inter, Manrope, Source_Serif_4, Noto_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const source_serif_4 = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "CivicHub - Report Local Issues",
  description: "Report and track local infrastructure issues in your community",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
