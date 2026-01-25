import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Sidebar } from "@/components/layout/Sidebar";
import { Bottombar } from "@/components/layout/Bottombar";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniTime",
  description: "アニメ番組表",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* アプリ全体のコンテナ */}
          <div className="flex h-screen w-full bg-background overflow-hidden">
            
            {/* 1. サイドバー (PC用) */}
          <Sidebar />

          {/* 2. メインコンテンツエリア */}
          {/* flex-1: 残りの幅を占有 */}
          {/* pb-16: モバイルでボトムバーの高さ分を確保 */}
          {/* md:pb-0: PCではボトムバーがないのでpadding不要 */}
          <main className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 relative overflow-hidden">
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