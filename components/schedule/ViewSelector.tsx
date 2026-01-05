"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, RadioTower } from "lucide-react";

export const ViewSelector = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "area";

  const handleValueChange = (value: string) => {
    // 現在のクエリパラメータをコピーしてインスタンス化
    const params = new URLSearchParams(searchParams.toString());
    // viewパラメータのみを更新
    params.set("view", value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <Tabs value={currentView} onValueChange={handleValueChange}>
      <TabsList>
        <TabsTrigger value="area" className="flex items-center gap-2">
          <Map className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="channel" className="flex items-center gap-2">
          <RadioTower className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};