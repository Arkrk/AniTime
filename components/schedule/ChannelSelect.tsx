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
  
  // エリア別にチャンネルをグループ化
  const groupedChannels = React.useMemo(() => {
    const groups = new Map<string, { order: number; channels: Channel[] }>();

    channels.forEach((channel) => {
      const areaName = channel.areas?.name || "その他";
      const areaOrder = channel.areas?.order ?? 9999;

      if (!groups.has(areaName)) {
        groups.set(areaName, { order: areaOrder, channels: [] });
      }
      groups.get(areaName)!.channels.push(channel);
    });

    // 配列に変換してorder順にソート
    return Array.from(groups.entries())
      .map(([name, data]) => ({
        name,
        order: data.order,
        channels: data.channels,
      }))
      .sort((a, b) => a.order - b.order);
  }, [channels]);

  return (
    <Select 
      value={value ? String(value) : ""} 
      onValueChange={(val) => onValueChange(Number(val))}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {groupedChannels.map((group) => (
          <div key={group.name}>
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
              {group.name}
            </div>
            {group.channels.map(channel => (
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
