import type { Metadata, Viewport } from "next";
import "@fontsource/ibm-plex-sans-arabic/300.css";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { Toaster } from "sonner";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "مختبر الإعلام الذكي | AI Media Lab",
    template: "%s | مختبر الإعلام الذكي",
  },
  description:
    "منصة عربية لأدوات الإعلام الذكي: غرفة الأخبار، والمحرر الصحفي، واستوديو الإنتاج، ومصمم البرامج التدريبية، ومختبر الأفكار الإعلامية.",
  applicationName: "AI Media Lab",
  openGraph: {
    title: "مختبر الإعلام الذكي | AI Media Lab",
    description: "مستقبل الإعلام يبدأ من هنا.",
    locale: "ar",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1a45",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          تخطَّ إلى المحتوى
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Toaster
          dir="rtl"
          position="bottom-left"
          richColors
          closeButton
          toastOptions={{ style: { fontFamily: "var(--font-sans)" } }}
        />
      </body>
    </html>
  );
}
