"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "@/types/supabase";

type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  areas: { id: number; name: string; order: number } | null;
};

interface ChannelSelectProps {
  channels: Channel[];
  value?: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export function ChannelSelect({ 
  channels, 
  value, 
  onValueChange, 
  placeholder = "チャンネルを選択",
  className
}: ChannelSelectProps) {
  
  // Group channels by area
  const channelsByArea = React.useMemo(() => channels.reduce((acc, channel) => {
    const areaName = channel.areas?.name || "その他";
    if (!acc[areaName]) acc[areaName] = [];
    acc[areaName].push(channel);
    return acc;
  }, {} as Record<string, Channel[]>), [channels]);

  return (
    <Select 
      value={value ? String(value) : ""} 
      onValueChange={(val) => onValueChange(Number(val))}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(channelsByArea).map(([area, areaChannels]) => (
          <div key={area}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
              {area}
            </div>
            {areaChannels.map(channel => (
              <SelectItem key={channel.id} value={channel.id.toString()}>
                {channel.name}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
