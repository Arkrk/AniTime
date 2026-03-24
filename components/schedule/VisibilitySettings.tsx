"use client";

import { useEffect, useState } from "react";
import { getAreasAndChannels } from "@/lib/actions";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Map, RadioTower } from "lucide-react";
import { cn } from "@/lib/utils";

type Area = { id: number; name: string; order: number };
type Channel = { id: number; name: string; order: number; area_id: number };

export function VisibilitySettings() {
  const { hiddenChannelIds, toggleChannel, setChannelVisibility, loaded } = useVisibilitySettings();
  const [areas, setAreas] = useState<Area[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    getAreasAndChannels().then((data) => {
      setAreas(data.areas || []);
      setChannels(data.channels || []);
      setLoadingData(false);
    });
  }, []);

  if (!loaded || loadingData) {
    return (
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          <div className="border rounded-md overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center bg-gray-50/50 dark:bg-neutral-900/50 border-b last:border-b-0 h-11.25">
                <div className="flex items-center pl-4 py-3 pr-3">
                  <Skeleton className="size-4 rounded-sm" />
                </div>
                <div className="flex flex-1 items-center justify-between py-3 pr-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="size-4 rounded-sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="flex flex-col gap-6 px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="border rounded-md overflow-hidden">
          <Accordion type="multiple">
            {areas.map((area) => {
              const areaChannels = channels.filter((c) => c.area_id === area.id);
              if (areaChannels.length === 0) return null;

              // そのエリアのすべてのチャンネルが表示されているかどうかを確認
              const allVisible = areaChannels.every(c => !hiddenChannelIds.includes(c.id));
              const someVisible = areaChannels.some(c => !hiddenChannelIds.includes(c.id));
              const isIndeterminate = someVisible && !allVisible;

              const handleAreaToggle = () => {
                const ids = areaChannels.map(c => c.id);
                if (allVisible) {
                  // すべて非表示
                  setChannelVisibility(ids, false);
                } else {
                  // すべて表示
                  setChannelVisibility(ids, true);
                }
              };

              return (
                <AccordionItem key={area.id} value={`area-${area.id}`} className="border-b last:border-b-0 group overflow-hidden">
                  <div className="flex items-center bg-gray-50/50 dark:bg-neutral-900/50 border-b -mb-px group-data-[state=open]:mb-0 relative z-10">
                    <div className="flex items-center pl-4 py-3 pr-3">
                      <Checkbox
                        id={`area-group-${area.id}`}
                        checked={isIndeterminate ? "indeterminate" : allVisible}
                        onCheckedChange={handleAreaToggle}
                      />
                    </div>
                    <AccordionPrimitive.Header className="flex flex-1">
                      <AccordionPrimitive.Trigger
                        className={cn(
                          "flex flex-1 items-center justify-between py-3 pr-4 font-bold transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                          "text-left text-sm"
                        )}
                      >
                        {area.name}
                        <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 ml-2" />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                  </div>
                  <AccordionContent className="p-0">
                    <div className="flex flex-col">
                      {areaChannels.map((channel) => (
                        <div
                          key={channel.id}
                          className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent transition-colors cursor-pointer pl-8"
                          onClick={() => toggleChannel(channel.id)}
                        >
                          <Checkbox
                            id={`channel-${channel.id}`}
                            checked={!hiddenChannelIds.includes(channel.id)}
                            className="pointer-events-none"
                          />
                          <Label
                            htmlFor={`channel-${channel.id}`}
                            className="text-sm font-medium flex-1 pointer-events-none cursor-pointer"
                          >
                            {channel.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
      </div>
    </ScrollArea>
  );
}
