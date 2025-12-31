"use client";

import React, { useEffect, useState } from "react";
import { getAreasAndChannels } from "@/lib/actions";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

type Area = { id: number; name: string; order: number };
type Channel = { id: number; name: string; order: number; area_id: number };

export function VisibilitySettings() {
  const { hiddenAreaIds, hiddenChannelIds, toggleArea, toggleChannel, setChannelVisibility, loaded } = useVisibilitySettings();
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
      <div className="flex items-center gap-2 text-gray-500 p-4">
        <Loader2 className="h-4 w-4 animate-spin" />
        設定を読み込み中...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-1">表示するエリア</h2>
        <p className="text-sm text-gray-500 mb-4">
          エリア別レイアウトで表示するエリアを選択できます。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {areas.map((area) => (
            <div 
              key={area.id} 
              className="flex items-center space-x-3 p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => toggleArea(area.id)}
            >
              <Checkbox
                id={`area-${area.id}`}
                checked={!hiddenAreaIds.includes(area.id)}
                className="pointer-events-none"
              />
              <Label 
                htmlFor={`area-${area.id}`} 
                className="text-sm font-medium flex-1 pointer-events-none"
              >
                {area.name}
              </Label>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-1">表示するチャンネル</h2>
        <p className="text-sm text-gray-500 mb-4">
          チャンネル別レイアウトで表示するチャンネルを選択できます。
        </p>
        <div className="border rounded-lg bg-white overflow-hidden">
          <Accordion type="multiple">
            {areas.map((area) => {
              const areaChannels = channels.filter((c) => c.area_id === area.id);
              if (areaChannels.length === 0) return null;

              // Check if all channels in this area are visible
              const allVisible = areaChannels.every(c => !hiddenChannelIds.includes(c.id));
              const someVisible = areaChannels.some(c => !hiddenChannelIds.includes(c.id));
              const isIndeterminate = someVisible && !allVisible;
              
              const handleAreaToggle = () => {
                const ids = areaChannels.map(c => c.id);
                if (allVisible) {
                  // Hide all
                  setChannelVisibility(ids, false);
                } else {
                  // Show all
                  setChannelVisibility(ids, true);
                }
              };

              return (
                <AccordionItem key={area.id} value={`area-${area.id}`} className="border-b last:border-b-0">
                  <div className="flex items-center bg-gray-50/50 border-b -mb-px">
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
                          "flex flex-1 items-center justify-between py-3 pr-4 font-bold text-gray-700 transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                          "text-left text-sm"
                        )}
                      >
                        {area.name}
                        <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 ml-2" />
                      </AccordionPrimitive.Trigger>
                    </AccordionPrimitive.Header>
                  </div>
                  <AccordionContent className="p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {areaChannels.map((channel) => (
                        <div 
                          key={channel.id} 
                          className="flex items-center space-x-3 p-3 border rounded-md bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => toggleChannel(channel.id)}
                        >
                          <Checkbox
                            id={`channel-${channel.id}`}
                            checked={!hiddenChannelIds.includes(channel.id)}
                            className="pointer-events-none"
                          />
                          <Label 
                            htmlFor={`channel-${channel.id}`} 
                            className="text-sm font-medium flex-1 pointer-events-none"
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
      </section>
    </div>
  );
}
