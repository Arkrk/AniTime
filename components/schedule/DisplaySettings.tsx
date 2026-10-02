"use client";

import { Settings, ChevronRight, Table, CalendarDays, Columns3, Map, RadioTower } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { VisibilitySettings } from "@/components/schedule/VisibilitySettings";
import { ChannelSelect } from "@/components/schedule/ChannelSelect";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { DayTabs } from "@/components/schedule/DayTabs";
import { AreaNavigator } from "@/components/schedule/AreaNavigator";
import { useDisplaySettings } from "@/hooks/use-display-settings";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { DAYS, getDayString } from "@/lib/format-days";

interface DisplaySettingsProps {
  channels?: any[];
  areas?: { id: number; name: string; order: number }[];
  seasons?: any[];
}

export function DisplaySettings({ channels = [], areas = [], seasons = [] }: DisplaySettingsProps) {
  const { showNewOnly, updateShowNewOnly, loaded } = useDisplaySettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const initialView = searchParams.get("view") || "default";
  const initialGrouping = searchParams.get("grouping") || "area";
  const initialDay = searchParams.get("day") || getDayString(1);
  const initialChannel = searchParams.get("channel") ? Number(searchParams.get("channel")) : (channels[0]?.id || 0);
  const initialArea = searchParams.get("area") ? Number(searchParams.get("area")) : (areas[0]?.id || 0);
  // URLには year-month 形式などが入る可能性があるが、SeasonSelectorの初期値はseason_id
  const currentSeasonStr = searchParams.get("season");
  const parsedSeason = seasons.find(s => currentSeasonStr === `${s.year}-${s.month}` || currentSeasonStr === s.id.toString());
  const initialSeason = parsedSeason ? parsedSeason.id : (seasons[0]?.id || 0);

  const [view, setView] = useState(initialView);
  const [grouping, setGrouping] = useState(initialGrouping);
  const [day, setDay] = useState(initialDay);
  const [channelId, setChannelId] = useState(initialChannel);
  const [areaId, setAreaId] = useState(initialArea);
  const [seasonId, setSeasonId] = useState(initialSeason);

  const hasChanges =
    view !== initialView ||
    grouping !== initialGrouping ||
    day !== initialDay ||
    channelId !== initialChannel ||
    areaId !== initialArea ||
    seasonId !== initialSeason;

  // ポップオーバーが開くたびに状態をURLパラメータと同期させる
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setGrouping(initialGrouping);
      setDay(initialDay);
      setChannelId(initialChannel);
      setAreaId(initialArea);
      setSeasonId(initialSeason);
    }
  }, [isOpen, initialView, initialGrouping, initialDay, initialChannel, initialArea, initialSeason]);

  const toggleNewOnly = () => {
    updateShowNewOnly(!showNewOnly);
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.set("grouping", grouping);
    params.set("day", day);
    params.set("channel", channelId.toString());
    params.set("area", areaId.toString());

    // seasonIdから year-month 形式に戻す
    const selectedSeason = seasons.find(s => s.id === seasonId);
    if (selectedSeason) {
      params.set("season", `${selectedSeason.year}-${selectedSeason.month}`);
    } else {
      params.set("season", seasonId.toString());
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loading-start", { detail: params.toString() }));
    }
    router.push(`${pathname}?${params.toString()}`);
    setIsOpen(false);
  };

  const viewOptions = [
    { value: "default", label: "デフォルト", icon: Table },
    { value: "week", label: "週間番組表", icon: CalendarDays },
    { value: "season", label: "前後番組表", icon: Columns3 },
  ];

  const groupingOptions = [
    { value: "area", label: "エリア", icon: Map },
    { value: "channel", label: "チャンネル", icon: RadioTower },
  ];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="secondary" size="icon">
          <Settings />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 overflow-hidden" align="end">
        <div className="flex flex-col">
          <div className="flex flex-col gap-4 p-4">
            <div className="flex flex-col gap-2">
              <Label>ビュー</Label>
              <div className="inline-flex w-full items-center justify-center rounded-2xl bg-muted p-1 text-muted-foreground">
                {viewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setView(option.value)}
                    type="button"
                    className={cn(
                      "relative inline-flex flex-1 flex-col items-center justify-center p-2 h-15 rounded-xl text-xs font-medium transition-all hover:text-foreground dark:hover:text-foreground",
                      view === option.value
                        ? "bg-background text-foreground dark:bg-input"
                        : "text-foreground/60 dark:text-muted-foreground"
                    )}
                  >
                    <option.icon className="size-5 mb-1.5" />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {view !== "season" && (
              <div className="flex flex-col gap-2">
                <Label>グルーピング</Label>
                <div className="inline-flex w-full items-center justify-center rounded-2xl bg-muted p-1 text-muted-foreground">
                  {groupingOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGrouping(option.value)}
                      type="button"
                      className={cn(
                        "relative inline-flex flex-1 flex-col items-center justify-center p-2 h-15 rounded-xl text-xs font-medium transition-all hover:text-foreground dark:hover:text-foreground",
                        grouping === option.value
                          ? "bg-background text-foreground dark:bg-input"
                          : "text-foreground/60 dark:text-muted-foreground"
                      )}
                    >
                      <option.icon className="size-5 mb-1.5" />
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {view !== "season" && (
              <div className="flex flex-col gap-2">
                <Label>放送クール</Label>
                <SeasonSelector
                  seasons={seasons}
                  value={seasonId}
                  onValueChange={(val) => setSeasonId(val !== null ? val : 0)}
                  className="w-full"
                />
              </div>
            )}

            {view !== "week" && (
              <div className="flex flex-col gap-2">
                <Label>曜日</Label>
                <DayTabs
                  value={day}
                  onValueChange={setDay}
                  forceTabs={true}
                  className="w-full"
                />
              </div>
            )}

            {(view === "season" || (view === "week" && grouping === "channel")) && channels.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>チャンネル</Label>
                <ChannelSelect
                  channels={channels}
                  value={channelId}
                  onValueChange={setChannelId}
                  className="w-full"
                />
              </div>
            )}

            {view === "week" && grouping === "area" && areas.length > 0 && (
              <div className="flex flex-col gap-2">
                <Label>エリア</Label>
                <AreaNavigator
                  areas={areas}
                  value={String(areaId)}
                  onValueChange={(val) => setAreaId(Number(val))}
                  className="w-full"
                />
              </div>
            )}

            <Button onClick={handleApply} disabled={!hasChanges} className="w-full mt-2">
              設定を適用
            </Button>
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
              <SheetContent className="w-screen sm:w-90 max-sm:border-none">
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
