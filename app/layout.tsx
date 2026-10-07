import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { profile } from "@/data/profile";
import { ToastProvider } from "@/components/ui/toast";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import PageTransition from "@/components/layout/page-transition";
import { Cursor } from "@/components/chrome/cursor";
import Preloader from "@/components/chrome/preloader";
import { Ambient } from "@/components/chrome/ambient";
import { TabTitle } from "@/components/brand/tab-title";
import { FaviconMotion } from "@/components/brand/favicon-motion";
import {
  BackToTop,
  IndexRail,
  ScrollProgress,
} from "@/components/chrome/chrome";
import { MusicPlayer } from "@/components/music/music-player";
import { AmbientMode } from "@/components/chrome/ambient-mode";

/* ==================================================================
   FONT — 3 chữ, mỗi chữ một việc.
   Sans cho giao diện, mono cho mọi thứ mang tính kỹ thuật,
   serif nghiêng để nhấn — sự tương phản đó là chữ ký của trang.
   ================================================================== */
const sans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  preload: true,
});

const display = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

const TITLE = `${profile.name} — ${profile.roleShort}`;
const DESC =
  "Portfolio của Quach Hưng — Product Engineer & Interface Architect. Thiết kế và xây những sản phẩm số .";

export const metadata: Metadata = {
  metadataBase: new URL("https://qhvn.vercel.app"),
  title: {
    default: TITLE,
    template: `%s · ${profile.name}`,
  },
  description: DESC,
  applicationName: profile.name,
  authors: [{ name: profile.name, url: "https://qhvn.vercel.app" }],
  creator: profile.name,
  publisher: profile.name,
  keywords: [
    "portfolio",
    "product engineer",
    "frontend developer",
    "Next.js",
    "React",
    "TypeScript",
    "UI engineer",
    "Hà Nội",
    "Việt Nam",
  ],
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    locale: "vi_VN",
    url: "/",
    siteName: profile.name,
    title: TITLE,
    description: DESC,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${profile.name} — ${profile.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    creator: "@qhvn",
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#06070a" },
    { media: "(prefers-color-scheme: light)", color: "#f7f8fa" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Chạy trước lúc paint: đặt class js + theme để không nháy màn hình */
const boot = `(function(){var r=document.documentElement;r.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){r.classList.toggle('dark',t==='dark')}else{r.classList.add('dark')}}catch(e){r.classList.add('dark')}})();`;

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: "https://qhvn.vercel.app",
  jobTitle: profile.role,
  description: profile.tagline,
  email: `mailto:${profile.email}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bắc Ninh",
    addressCountry: "Viêt Nam",
  },
  knowsAbout: [
    "React",
    "Next.js",
    "TypeScript",
    "Claude",
    "Codex",
    "Zhipu",
    "Python",
  ],
  sameAs: profile.socials.map((s) => s.href),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${sans.variable} ${mono.variable} ${display.variable} antialiased`}
      >
        <ToastProvider>
          <PageTransition>
            <TabTitle />
            <FaviconMotion />

            <a
              href="#main"
              className="skip-link glass rounded-full px-4 py-2 text-[13px] text-fg"
            >
              Bỏ qua tới nội dung chính .
            </a>

            <Preloader />
            <ScrollProgress />
            <Ambient />
            <Cursor />

            <Navbar />
            <IndexRail />
            <BackToTop />
            <MusicPlayer />
            <AmbientMode />

            <main id="main" className="relative">
              {children}
            </main>

            <Footer />
          </PageTransition>
        </ToastProvider>
      </body>
    </html>
  );
}
