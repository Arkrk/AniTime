"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Map, RadioTower, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export const ViewSelector = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "area";

  const handleValueChange = (value: string) => {
    // 現在のクエリパラメータをコピーしてインスタンス化
    const params = new URLSearchParams(searchParams.toString());
    // viewパラメータのみを更新
    params.set("view", value);
    router.push(`/?${params.toString()}`);
  };

  const options = [
    { value: "area", label: "エリア", icon: Map },
    { value: "channel", label: "チャンネル", icon: RadioTower },
    { value: "week", label: "週間番組表", icon: CalendarDays },
  ];

  return (
    <div className="flex gap-2 w-full">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleValueChange(option.value)}
          type="button"
          className={cn(
            "flex flex-col items-center justify-center p-2 h-16 flex-1 rounded-md border text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
            currentView === option.value
              ? "border-primary text-primary bg-primary/5"
              : "border-border text-muted-foreground"
          )}
        >
          <option.icon className="h-5 w-5 mb-1.5" />
          {option.label}
        </button>
      ))}
    </div>
  );
};