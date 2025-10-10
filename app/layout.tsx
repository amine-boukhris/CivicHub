import type React from "react";
import type { Metadata } from "next";
import { Recursive, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive",
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
