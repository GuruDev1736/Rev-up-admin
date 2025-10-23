"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Pages that don't need sidebar and header (auth pages)
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/" || pathname === "/forgot-password";

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {isAuthPage ? (
          // For auth pages, render without sidebar and header
          <div className="min-h-screen bg-[#fffafa]">
            {children}
          </div>
        ) : (
          // For authenticated pages, render with sidebar and header
          <div className="flex h-screen overflow-hidden bg-[#fffafa]">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto w-full">
                <Header />
                {children}
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
