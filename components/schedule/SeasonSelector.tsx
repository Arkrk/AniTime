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
  currentSeasonId?: number | "all" | null;
  onValueChange?: (value: number | null) => void;
  showAll?: boolean;
};

export const SeasonSelector = ({ seasons, currentSeasonId, onValueChange, showAll }: SeasonSelectorProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleValueChange = (value: string) => {
    if (onValueChange) {
      if (value === "none" || value === "all") {
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
    // シーズン変更時はページ番号をリセットする
    params.delete("page");

    // オーバーレイ用のイベントを発火
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loading-start", { detail: params.toString() }));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  // activeがtrueのグループ: 年月昇順
  const activeSeasons = seasons.filter((s) => s.active);

  // activeがfalseのグループ: 年月降順
  const inactiveSeasons = seasons.filter((s) => !s.active);

  const selectValue = currentSeasonId !== undefined && currentSeasonId !== null
    ? currentSeasonId.toString()
    : showAll ? "all" : "none";

  return (
    <Select
      value={selectValue}
      onValueChange={handleValueChange}
    >
      <SelectTrigger>
        <SelectValue placeholder="放送クールを選択" />
      </SelectTrigger>
      <SelectContent position="popper">
        {showAll && (
          <>
            <SelectGroup>
              <SelectItem value="all">すべて</SelectItem>
            </SelectGroup>
            {(activeSeasons.length > 0 || inactiveSeasons.length > 0) && <SelectSeparator />}
          </>
        )}
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