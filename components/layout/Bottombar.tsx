"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table2, Bookmark, Bolt, Database } from "lucide-react";
import { useLogin } from "@/hooks/login";
import { useEffect, useState } from "react";

export const Bottombar = () => {
  const pathname = usePathname();
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
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 border-t flex items-center justify-around md:hidden pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors",
            pathname === item.href
              ? "text-foreground"
              : "text-gray-400 hover:text-slate-900 dark:text-gray-500 dark:hover:text-white"
          )}
          title={item.label}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};