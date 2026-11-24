import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { AuthProvider } from "@/features/auth";

const ltSuperior = localFont({
  src: [
    { path: "../../public/fonts/LTSuperior-Regular.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/LTSuperior-Medium.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/LTSuperior-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/LTSuperior-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const aristotelica = localFont({
  src: [
    { path: "../../public/fonts/Aristotelica-Display.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagLine}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author }],
  keywords: [
    "accessibility",
    "mobility decision support",
    "built environment audit",
    "expert system",
    "universal design",
    "accessible transit",
    "barrier identification",
    "explainable AI",
  ],
  metadataBase: new URL(siteConfig.url),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbfbfa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ltSuperior.variable} ${aristotelica.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#fbfbfa] text-[#111110] selection:bg-teal-500/15 selection:text-teal-900 font-sans tracking-[-0.011em]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
