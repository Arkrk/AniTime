"use client";

import { Settings, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ViewSelector } from "./ViewSelector";
import { VisibilitySettings } from "@/components/schedule/VisibilitySettings";
import { useDisplaySettings } from "@/hooks/use-display-settings";

export function DisplaySettings() {
  const { showNewOnly, updateShowNewOnly, loaded } = useDisplaySettings();

  const toggleNewOnly = () => {
    updateShowNewOnly(!showNewOnly);
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
              className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent cursor-pointer"
              onClick={toggleNewOnly}
            >
              <Label className="w-full cursor-pointer pointer-events-none">
                新作アニメのみを表示
              </Label>
              <Switch checked={showNewOnly} className="pointer-events-none" />
            </div>
            <div className="h-px bg-border" />
            <Sheet>
              <SheetTrigger asChild>
                <div 
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-accent cursor-pointer"
                >
                  <Label className="w-full cursor-pointer pointer-events-none">
                    チャンネル表示設定
                  </Label>
                  <div className="flex h-[1.15rem] items-center">
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </SheetTrigger>
              <SheetContent className="w-screen sm:w-100">
                <SheetHeader>
                  <SheetTitle>チャンネル表示設定</SheetTitle>
                  <SheetDescription className="sr-only">チャンネルの表示・非表示を設定します</SheetDescription>
                </SheetHeader>
                <VisibilitySettings />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
