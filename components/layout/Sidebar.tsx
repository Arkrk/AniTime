import Link from "next/link";
import { CalendarDays, Search, Clapperboard, Radio } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Sidebar = () => {
  const navItems = [
    { label: "番組表", icon: CalendarDays, href: "/" },
    { label: "検索", icon: Search, href: "/search" },
    { label: "作品", icon: Clapperboard, href: "/works" },
    { label: "放送局", icon: Radio, href: "/channels" },
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
                  className="group flex flex-col items-center gap-1 text-gray-400 hover:text-slate-900 transition-colors"
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

      {/* 下部のダミーエリア */}
      <div className="mt-auto">
      </div>
    </aside>
  );
};