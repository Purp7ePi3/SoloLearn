import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./navbar/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApiNasaTester",
  description: "simo's work",
  icons: {
    icon: '/favicon-32.ico',
    other: [
      { url: '/favicon-256.ico', sizes: '256x256', type: 'image/x-icon' },
      { url: '/favicon-512.ico', sizes: '512x512', type: 'image/x-icon' },
    ],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
         <Navbar />
        {children}
      </body>
    </html>
  );
}
