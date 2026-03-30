import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CU Prep",
  description: "Preparing your next interview!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-bgc text-foreground`}
      >
        <Navbar />
        <div className="min-h-screen pt-[72px]">{children}</div>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgb(23, 23, 23)',
              border: '1px solid rgb(38, 38, 38)',
              color: 'rgb(250, 250, 250)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
            },
            duration: 4000,
          }}
          richColors
        />
      </body>
    </html>
  );
}
