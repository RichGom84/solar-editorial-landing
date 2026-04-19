import type { Metadata } from "next";
import { AuthProvider } from "@/components/providers/AuthProvider";
import FirebaseAnalytics from "@/components/providers/FirebaseAnalytics";
import "./globals.css";

const siteUrl = "https://solarv.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "태양광 설치 무료 상담 | Solar Editorial",
    template: "%s | Solar Editorial",
  },
  description:
    "전기요금 걱정 끝! 프리미엄 태양광 전문가가 상담부터 보조금 신청, 맞춤 설계, 시공, A/S까지 원스톱으로 도와드립니다.",
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "태양광 설치 무료 상담 | Solar Editorial",
    description:
      "전기요금 최대 80% 절감, 정부보조금 최대 200만원. 프리미엄 태양광 시공 전문 Solar Editorial.",
    siteName: "Solar Editorial",
    locale: "ko_KR",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630, alt: "태양광 상담서비스" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "태양광 설치 무료 상담 | Solar Editorial",
    description: "전기요금 최대 80% 절감. 원스톱 태양광 솔루션.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  keywords: ["태양광 설치", "태양광 보조금", "전기요금 절감", "Solar Editorial"],
  icons: {
    icon: [{ url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
        <FirebaseAnalytics />
      </body>
    </html>
  );
}
