"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Table2, Bookmark, History, Database, Bolt } from "lucide-react";
import { useLogin } from "@/hooks/login";
import { useEffect, useState, PointerEvent } from "react";

const RippleLink = ({
  href,
  className,
  title,
  children,
}: {
  href: string;
  className?: string;
  title?: string;
  children: React.ReactNode;
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number; id: number }[]>([]);

  const handlePointerDown = (e: PointerEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
  };

  return (
    <Link
      href={href}
      className={cn("relative overflow-hidden", className)}
      title={title}
      onPointerDown={handlePointerDown}
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          className="absolute bg-foreground/15 rounded-full pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: r.size,
            height: r.size,
            transform: "scale(0)",
            animation: "nav-ripple 600ms linear",
            opacity: 0.5,
          }}
          onAnimationEnd={() => setRipples((prev) => prev.filter((p) => p.id !== r.id))}
        />
      ))}
      {children}
    </Link>
  );
};

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
    { label: "更新履歴", icon: History, href: "/updates" },
    ...(mounted && user ? [{ label: "データ管理", icon: Database, href: "/admin" }] : []),
    { label: "設定", icon: Bolt, href: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-100 w-full border-t bg-background md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => (
          <RippleLink
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
          </RippleLink>
        ))}
      </div>
      <style>{`
        @keyframes nav-ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </nav>
  );
};