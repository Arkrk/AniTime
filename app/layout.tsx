import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/Sidebar";
import { Bottombar } from "@/components/layout/Bottombar";
import { Toaster } from "@/components/ui/sonner";
import { ThemeColorManager } from "@/components/theme-color-manager";
import { defaultOpenGraph } from "@/lib/metadata";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-sans-jp" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "AniTime", template: `%s - AniTime`},
  description: "TVアニメ番組表",
  openGraph: {
    ...defaultOpenGraph,
    title: { default: "AniTime", template: `%s - AniTime` },
    description: "TVアニメ番組表",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: { default: "AniTime", template: `%s - AniTime` },
    description: "TVアニメ番組表",
    images: "/opengraph-image.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning className={`${inter.variable} ${notoSansJP.variable}`}>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ThemeColorManager />
          {/* アプリ全体のコンテナ */}
          <div className="flex h-dvh md:h-screen w-full bg-background overflow-hidden">
            
          {/* 1. サイドバー (PC用) */}
          <Sidebar />

          {/* 2. メインコンテンツエリア */}
          {/* flex-1: 残りの幅を占有 */}
          {/* pb-16: モバイルでボトムバーの高さ分を確保 */}
          {/* md:pb-0: PCではボトムバーがないのでpadding不要 */}
          <main className="flex-1 flex flex-col min-w-0 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative overflow-hidden">
            {children}
          </main>

          {/* 3. ボトムバー (モバイル用) */}
          <Bottombar />
          
        </div>
        <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}