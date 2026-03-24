import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-display",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qrcodebusiness.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QR Code da Fortuna | Gerador de QR Code Profissional",
    template: "%s | QR Code da Fortuna",
  },
  description:
    "Crie QR Codes dinâmicos, personalizados e rastreáveis em segundos. Ideal para restaurantes, eventos e pequenos negócios. Comece grátis agora.",
  keywords: [
    "gerador de qr code",
    "qr code grátis",
    "qr code dinâmico",
    "qr code para restaurante",
    "qr code para cardápio",
    "qr code personalizado",
    "criar qr code",
    "qr code rastreável",
    "qr code para pix",
    "qr code para whatsapp",
    "qr code para eventos",
    "melhor gerador de qr code",
    "qr code online",
    "qr code business",
  ],
  authors: [{ name: "QR Code da Fortuna" }],
  creator: "QR Code da Fortuna",
  publisher: "QR Code da Fortuna",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "QR Code da Fortuna",
    title: "QR Code da Fortuna | Gerador de QR Code Profissional",
    description:
      "Crie QR Codes dinâmicos, personalizados e rastreáveis em segundos. Comece grátis.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "QR Code da Fortuna — Gerador Profissional de QR Codes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "QR Code da Fortuna | Gerador de QR Code Profissional",
    description:
      "Crie QR Codes dinâmicos e rastreáveis em segundos. Comece grátis.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    google: "googleaf550366feb324c4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lexend.variable}`}>
      <body className="antialiased min-h-screen">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
