"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Season } from "@/lib/get-seasons";

type SeasonSelectorProps = {
  seasons: Season[];
  currentSeasonId: number;
};

export const SeasonSelector = ({ seasons, currentSeasonId }: SeasonSelectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    // 現在のクエリパラメータをコピーしてインスタンス化
    const params = new URLSearchParams(searchParams.toString());
     // seasonのみを更新
    params.set("season", value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      value={currentSeasonId.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger className="bg-white">
        <SelectValue placeholder="放送クールを選択" />
      </SelectTrigger>
      <SelectContent className="z-100">
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.id.toString()}>
            {season.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};