"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export function AllDayToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 現在の状態を取得
  const showAllDay = searchParams.get("allDay") === "true";

  const toggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (showAllDay) {
      params.delete("allDay");
    } else {
      params.set("allDay", "true");
    }
    router.push(pathname + "?" + params.toString());
  }, [searchParams, showAllDay, pathname, router]);

  return (
    <Button
      variant={showAllDay ? "default" : "outline"}
      onClick={toggle}
    >
      {showAllDay ? "全日帯を隠す" : "全日帯を表示"}
    </Button>
  );
}
