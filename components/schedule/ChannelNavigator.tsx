"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChannelSelect } from "./ChannelSelect";
import { Database } from "@/types/supabase";

type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  areas: { id: number; name: string; order: number } | null;
};

interface ChannelNavigatorProps {
  channels: Channel[];
  currentChannelId: number;
}

export function ChannelNavigator({ channels, currentChannelId }: ChannelNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleChannelChange = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("channel", value.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <ChannelSelect
      channels={channels}
      value={currentChannelId}
      onValueChange={handleChannelChange}
      className="w-[200px]"
    />
  );
}
