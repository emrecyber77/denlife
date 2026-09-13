import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "DENLIFE | Denizli Şehir Rehberi", template: "%s | DENLIFE" },
  description: "Denizli etkinlikleri, mekanları, gezilecek yerleri ve şehir yaşamı için güncel rehber.",
  metadataBase: new URL("https://denlife.vercel.app"),
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "DENLIFE | Denizli Şehir Rehberi",
    description: "Denizli'de bugün ne var? Etkinlik, mekan, gezi ve ulaşım rehberi.",
    type: "website",
    locale: "tr_TR",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="tr"><body>{children}</body></html>;
}
