import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from "@/components/ui/sonner";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Track your income and expenses easily",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Expense Tracker",
  },
  icons: {
    apple: [
      { url: "/next.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#fafafa] text-slate-900 flex flex-col md:flex-row min-h-dvh h-dvh overflow-hidden selection:bg-indigo-500 selection:text-white`}
      >
        <div className="fixed inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 -z-10" />
        <div className="fixed inset-0 bg-gradient-to-tr from-indigo-50/20 via-white to-purple-50/20 -z-20" />
        <Navigation />
        <main className="flex-1 pb-24 md:pb-0 overflow-y-auto overflow-x-hidden transition-all duration-300 scroll-smooth overscroll-contain">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </main>
        <Toaster position="top-center" richColors />
      </body>

    </html>
  );
}
