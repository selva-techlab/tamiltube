import type { Metadata } from "next";
import { Noto_Sans_Tamil } from "next/font/google";
import "./globals.css";

// Used for Tamil text; English uses the system UI font (see globals.css).
const tamil = Noto_Sans_Tamil({
  variable: "--font-tamil",
  subsets: ["tamil", "latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "TamilTube — curated tech videos",
  description:
    "Hand-picked AI, machine learning and data videos for Tamil speakers. No ads, no algorithm.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ta" className={`${tamil.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
