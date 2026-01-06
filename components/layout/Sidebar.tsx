"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table2, Search, Bolt, Bookmark, Database } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useLogin } from "@/hooks/login";

export const Sidebar = () => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { label: "番組表", icon: Table2, href: "/" },
    { label: "保存済み", icon: Bookmark, href: "/saved" },
    ...(mounted && user ? [{ label: "データ管理", icon: Database, href: "/admin" }] : []),
    { label: "設定", icon: Bolt, href: "/settings" },
  ];

  return (
    <aside className="hidden md:flex w-18 h-screen border-r bg-white flex-col items-center py-6 shrink-0 z-50">
      {/* ロゴ */}
      <div className="mb-auto">
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-700 transition-colors">
          AT
        </Link>
      </div>

      {/* ナビゲーション */}
      <nav className="flex flex-col gap-10 items-center justify-center">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex flex-col items-center gap-1 transition-colors",
                    pathname === item.href
                      ? "text-slate-900"
                      : "text-gray-400 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-7 h-7 group-hover:scale-110 transition-transform stroke-[1.5]" />
                </Link>
              </TooltipTrigger>
              
              <TooltipContent side="right" className="font-medium">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>

      {/* 検索ボタン */}
      <div className="mt-auto">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => setSearchOpen(true)}
                className="text-gray-400 hover:text-slate-900 transition-colors"
              >
                <Search className="w-7 h-7 stroke-[1.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              <p>検索</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  );
};