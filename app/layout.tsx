import type { Metadata } from "next";
import { Geist_Mono, Libre_Bodoni } from "next/font/google";

import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

import "./globals.css";

const bodoni = Libre_Bodoni({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Accelerando",
    template: "%s | Accelerando",
  },
  description:
    "A guided listening companion for classical music with synced annotations and reasoned recommendations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        bodoni.variable,
        geistMono.variable,
        "font-sans",
      )}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
