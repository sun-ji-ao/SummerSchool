import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Providers } from "@/app/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SummerSchool-UK",
  description: "SummerSchool-UK reconstructed website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900">
        <Providers>
          <header className="border-b border-slate-200">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="text-lg font-semibold">
                SummerSchool-UK
              </Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/course-finder">Course Finder</Link>
                <Link href="/contact-us">Contact</Link>
                <Link href="/booking-form">Booking</Link>
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>
          {children}
          <footer className="mt-auto border-t border-slate-200">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 text-sm text-slate-600">
              <p>2026 SummerSchool-UK</p>
              <div className="flex gap-4">
                <Link href="/privacy-policy">Privacy</Link>
                <Link href="/cookies">Cookies</Link>
                <Link href="/parents/terms">Terms</Link>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
