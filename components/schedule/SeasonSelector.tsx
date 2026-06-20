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
  currentSeasonId?: number | null;
  onValueChange?: (value: number | null) => void;
};

export const SeasonSelector = ({ seasons, currentSeasonId, onValueChange }: SeasonSelectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    if (onValueChange) {
      if (value === "none") {
        onValueChange(null);
      } else {
        onValueChange(Number(value));
      }
      return;
    }

    // 現在のクエリパラメータをコピーしてインスタンス化
    const params = new URLSearchParams(searchParams.toString());
    // seasonのみを更新
    params.set("season", value);

    // オーバーレイ用のイベントを発火
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("season-change-start", { detail: params.toString() }));
      window.dispatchEvent(new CustomEvent("schedule-change-start", { detail: params.toString() }));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // activeがtrueのグループ: 年月昇順
  const activeSeasons = seasons.filter((s) => s.active);

  // activeがfalseのグループ: 年月降順
  const inactiveSeasons = seasons.filter((s) => !s.active);

  const selectValue = currentSeasonId !== undefined && currentSeasonId !== null
    ? currentSeasonId.toString()
    : "none";

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="放送クールを選択" />
      </SelectTrigger>
      <SelectContent position="popper">
        {onValueChange && (
          <>
            <SelectGroup>
              <SelectItem value="none">未設定</SelectItem>
            </SelectGroup>
            {(activeSeasons.length > 0 || inactiveSeasons.length > 0) && <SelectSeparator />}
          </>
        )}
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