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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.geradordeqrcode.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Gerador de QR Code Grátis | Criar QR Code Dinâmico e Pix",
    template: "%s | Gerador de Qr Code",
  },
  description:
    "Crie QR Codes profissionais, dinâmicos e rastreáveis em segundos. Personalize com sua marca, gere códigos para Pix, WhatsApp e links. O melhor Gerador de Qr Code do Brasil.",
  keywords: [
    "gerador de qr code",
    "criar qr code",
    "qr code dinâmico",
    "qr code pix",
    "qr code grátis",
    "qr code para restaurante",
    "qr code para cardápio",
    "qr code personalizado",
    "qr code rastreável",
    "qr code para whatsapp",
    "melhor gerador de qr code",
    "gerar qr code online",
  ],
  authors: [{ name: "Gerador de Qr Code" }],
  creator: "Gerador de Qr Code",
  publisher: "Gerador de Qr Code",
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
    siteName: "Gerador de Qr Code",
    title: "Gerador de Qr Code | Criar QR Code Profissional Grátis",
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
    title: "Gerador de Qr Code | Criar QR Code Profissional Grátis",
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
