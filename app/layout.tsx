import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
=======
import { Mona_Sans } from "next/font/google";
>>>>>>> 1a1d0b5c454306c77806376f80a5da067059a0f1
import "./globals.css";
import Navbar from "@/components/Navbar";

const monaSans = Mona_Sans({
  variable: "--font-mona-sans",
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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
          <Navbar/>
          <div className="h-screen pt-[100px]">
            {children}
          </div>
        <Toaster/>
      </body>
    </html>
  );
}
