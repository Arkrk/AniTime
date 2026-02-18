"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
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

  // activeがtrueのグループ: 年月昇順
  const activeSeasons = seasons
    .filter((s) => s.active);
  
  // activeがfalseのグループ: 年月降順
  const inactiveSeasons = seasons
    .filter((s) => !s.active);

  return (
    <Select
      value={currentSeasonId.toString()}
      onValueChange={handleValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="放送クールを選択" />
      </SelectTrigger>
      <SelectContent position="popper">
        {activeSeasons.length > 0 && (
          <SelectGroup>
            <SelectLabel>更新中</SelectLabel>
            {activeSeasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {activeSeasons.length > 0 && inactiveSeasons.length > 0 && (
          <SelectSeparator />
        )}
        {inactiveSeasons.length > 0 && (
          <SelectGroup>
            <SelectLabel>アーカイブ</SelectLabel>
            {inactiveSeasons.map((season) => (
              <SelectItem key={season.id} value={season.id.toString()}>
                {season.name}
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
};