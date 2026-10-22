import type { Metadata, Viewport } from "next";
import type { ReactNode, CSSProperties } from "react";
import { Cairo, Almarai, Tajawal, Space_Grotesk, Syne } from "next/font/google";
import "./globals.css";
import { ensureSeeded } from "@/lib/seed";
import { getPublishedSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });
const almarai = Almarai({ subsets: ["arabic"], weight: ["300", "400", "700", "800"], variable: "--font-almarai", display: "swap" });
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["200", "300", "400", "500", "700", "800", "900"], variable: "--font-tajawal", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

const AR_FONT: Record<string, string> = {
  cairo: "var(--font-cairo)",
  almarai: "var(--font-almarai)",
  tajawal: "var(--font-tajawal)",
};
const EN_FONT: Record<string, string> = {
  grotesk: "var(--font-grotesk)",
  syne: "var(--font-syne)",
};

function siteUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  await ensureSeeded();
  const s = await getPublishedSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: {
      default: `${s.brand.name} | ${s.brand.title}`,
      template: `%s | ${s.brand.name}`,
    },
    description: s.brand.tagline,
    keywords: ["تصميم جرافيك", "هوية بصرية", "موشن جرافيك", "إعلانات", "Graphic Design"],
    openGraph: {
      siteName: s.brand.name,
      title: `${s.brand.name} | ${s.brand.title}`,
      description: s.brand.tagline,
      type: "website",
      locale: "ar_AR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.brand.name} | ${s.brand.title}`,
      description: s.brand.tagline,
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0c0c0f",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const s = await getPublishedSettings();
  const d = s.design;

  const styleVars = {
    "--c-primary": d.colors.primary,
    "--c-accent": d.colors.accent,
    "--c-bg": d.colors.bg,
    "--c-surface": d.colors.surface,
    "--c-text": d.colors.text,
    "--c-muted": d.colors.muted,
    "--c-button": d.colors.button,
    "--c-button-text": d.colors.buttonText,
    "--c-link": d.colors.link,
    "--radius": `${Math.min(Math.max(d.radius, 0), 32)}px`,
    "--site-font-ar": AR_FONT[d.fonts.arabic] ?? "var(--font-cairo)",
    "--site-font-en": EN_FONT[d.fonts.latin] ?? "var(--font-grotesk)",
  } as CSSProperties;

  return (
    <html
      lang="ar"
      dir="rtl"
      data-theme={d.theme}
      data-scale={d.headingScale}
      data-shadow={d.shadow}
      data-anim={d.animations ? "on" : "off"}
      style={styleVars}
      className={`${cairo.variable} ${almarai.variable} ${tajawal.variable} ${grotesk.variable} ${syne.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
