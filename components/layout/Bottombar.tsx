import Link from "next/link";
import { CalendarDays, Search, Clapperboard, Radio } from "lucide-react";

export const Bottombar = () => {
  const navItems = [
    { label: "番組表", icon: CalendarDays, href: "/" },
    { label: "検索", icon: Search, href: "/search" },
    { label: "作品", icon: Clapperboard, href: "/works" },
    { label: "放送局", icon: Radio, href: "/channels" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t flex items-center justify-around md:hidden pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="flex flex-col items-center justify-center w-full h-full text-gray-400 hover:text-slate-900 active:text-slate-900 transition-colors"
          title={item.label}
        >
          <item.icon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
};