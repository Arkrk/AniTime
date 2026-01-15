"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ViewSelector } from "./ViewSelector";

export function DisplaySettings() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showAllDay = searchParams.get("allDay") === "true";
  const isSavedOnly = searchParams.get("savedOnly") === "true";

  const toggleAllDay = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (showAllDay) {
      params.delete("allDay");
    } else {
      params.set("allDay", "true");
    }
    router.push(pathname + "?" + params.toString());
  };

  const toggleSavedOnly = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isSavedOnly) {
      params.delete("savedOnly");
    } else {
      params.set("savedOnly", "true");
    }
    router.push(pathname + "?" + params.toString());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="flex flex-col">
          <div className="flex flex-col gap-3 p-4">
            <Label>レイアウトモード</Label>
            <ViewSelector />
          </div>
          <div className="h-px bg-border" />
          <div className="flex flex-col">
            <div 
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={toggleAllDay}
            >
              <Label className="w-full cursor-pointer pointer-events-none">
                全日帯の番組を表示
              </Label>
              <Switch checked={showAllDay} className="pointer-events-none" />
            </div>
            <div className="h-px bg-border" />
            <div 
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
              onClick={toggleSavedOnly}
            >
              <Label className="w-full cursor-pointer pointer-events-none">
                保存した番組のみを表示
              </Label>
              <Switch checked={isSavedOnly} className="pointer-events-none" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
