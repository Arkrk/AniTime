"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Layout } from "lucide-react";

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
    <Select value={currentView} onValueChange={handleValueChange}>
      <SelectTrigger className="bg-white">
        <div className="flex items-center gap-2 text-gray-600">
          <Layout className="h-4 w-4" />
          <SelectValue placeholder="表示切替" />
        </div>
      </SelectTrigger>
      <SelectContent className="z-100">
        <SelectItem value="area">エリア別</SelectItem>
        <SelectItem value="channel">チャンネル別</SelectItem>
      </SelectContent>
    </Select>
  );
};