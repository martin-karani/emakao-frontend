import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "eMakao | The Operating System for Modern Real Estate",
  description: "End-to-end property management, automated financial reconciliation, and a seamless tenant experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} antialiased selection:bg-fuchsia-500/30`}>
        {children}
      </body>
    </html>
  );
}
