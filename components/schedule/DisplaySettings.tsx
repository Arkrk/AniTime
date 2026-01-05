"use client";

import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AllDayToggle } from "./AllDayToggle";
import { SavedOnlyToggle } from "./SavedOnlyToggle";
import { ViewSelector } from "./ViewSelector";

export function DisplaySettings() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Label>レイアウトモード</Label>
            <ViewSelector />
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="all-day-mode">全日帯の番組を表示</Label>
            <AllDayToggle />
          </div>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="saved-only-mode">保存した番組のみを表示</Label>
            <SavedOnlyToggle />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
