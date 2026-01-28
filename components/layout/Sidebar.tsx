"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table2, Search, Bolt, Bookmark, Database } from "lucide-react";
import icon from "@/app/icon0.svg";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useLogin } from "@/hooks/login";
import { Kbd } from "@/components/ui/kbd";
import { useOs } from "@/hooks/use-os";

export const Sidebar = () => {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const os = useOs();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const navItems = [
    { label: "番組表", icon: Table2, href: "/" },
    { label: "保存済み", icon: Bookmark, href: "/saved" },
    ...(mounted && user ? [{ label: "データ管理", icon: Database, href: "/admin" }] : []),
    { label: "設定", icon: Bolt, href: "/settings" },
  ];

  return (
    <aside className="hidden md:flex w-18 h-screen border-r flex-col items-center py-6 shrink-0 z-50">
      {/* ロゴ */}
      <div className="mb-auto">
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
          <Image src={icon} alt="AniTime" width={28} height={28} />
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
                      ? "text-foreground"
                      : "text-gray-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white"
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
                className="group text-gray-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white transition-colors"
              >
                <Search className="w-7 h-7 group-hover:scale-110 transition-transform stroke-[1.5]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium flex items-center gap-2">
              <p>検索</p>
              <Kbd>
                <span className="text-xs">{os === "mac" ? "⌘" : "Ctrl + "}</span>K
              </Kbd>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </aside>
  );
};