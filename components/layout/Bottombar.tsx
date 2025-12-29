"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table2, Bookmark, Info } from "lucide-react";

export const Bottombar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: "番組表", icon: Table2, href: "/" },
    { label: "保存済み", icon: Bookmark, href: "/saved" },
    { label: "情報", icon: Info, href: "/about" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t flex items-center justify-around md:hidden pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col items-center justify-center w-full h-full transition-colors",
            pathname === item.href
              ? "text-slate-900"
              : "text-gray-400 hover:text-slate-900 active:text-slate-900"
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