"use client";

import React, { useMemo } from "react";
import { ProgramData, LayoutMode } from "@/types/schedule";
import {
  calculateLayout,
  calculatePosition,
  START_HOUR,
  END_HOUR,
  HOUR_HEIGHT,
  MIN_HEIGHT,
  COL_WIDTH,
  TIME_COL_WIDTH,
  HEADER_HEIGHT,
  MOBILE_HOUR_HEIGHT,
  MOBILE_MIN_HEIGHT,
  MOBILE_COL_WIDTH,
  MOBILE_TIME_COL_WIDTH,
  MOBILE_HEADER_HEIGHT,
} from "@/lib/schedule-utils";
import { ProgramCard } from "./ProgramCard";
import { Toolbar } from "./Toolbar";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";
import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { TvMinimal } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";

type TimeTableProps = {
  programs: ProgramData[];
  mode?: LayoutMode;
  showAllDay: boolean;
  showSavedOnly?: boolean;
  ogPreviews?: Record<string, React.ReactNode>;
};

export const TimeTable: React.FC<TimeTableProps> = ({ programs, mode = "area", showAllDay, showSavedOnly = false, ogPreviews }) => {
  const { hiddenChannelIds, loaded } = useVisibilitySettings();
  const { savedIds } = useSavedPrograms();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const currentHourHeight = isDesktop ? HOUR_HEIGHT : MOBILE_HOUR_HEIGHT;
  const currentMinHeight = isDesktop ? MIN_HEIGHT : MOBILE_MIN_HEIGHT;
  const currentColWidth = isDesktop ? COL_WIDTH : MOBILE_COL_WIDTH;
  const currentTimeColWidth = isDesktop ? TIME_COL_WIDTH : MOBILE_TIME_COL_WIDTH;
  const currentHeaderHeight = isDesktop ? HEADER_HEIGHT : MOBILE_HEADER_HEIGHT;

  // チャンネル・番組のレイアウト計算
  const channels = useMemo(() => {
    let filteredPrograms = programs;
    if (showSavedOnly) {
      filteredPrograms = programs.filter((p) => savedIds.includes(String(p.id)));
    }

    if (loaded && mode !== "week") {
      filteredPrograms = filteredPrograms.filter((p) => !hiddenChannelIds.includes(p.channel_id));
    }

    return calculateLayout(filteredPrograms, mode, {
      minHeight: currentMinHeight,
      colWidth: currentColWidth,
    });
  }, [programs, mode, hiddenChannelIds, loaded, showSavedOnly, savedIds, currentMinHeight, currentColWidth]);

  // 表示する時間帯（hour）のリストを計算
  const { visibleHours, hourToY, totalHeight } = useMemo(() => {
    const hours = new Set<number>();
    
    // 20時〜29時は常に表示
    for (let h = 20; h < END_HOUR; h++) {
      hours.add(h);
    }

    // 全日帯表示がONの場合、番組が存在する時間帯（6時〜19時）も追加
    if (showAllDay) {
      programs.forEach((p) => {
        const { minutesFromStart: startMin } = calculatePosition(p.start_time);
        const { minutesFromStart: endMin } = calculatePosition(p.end_time);
        
        // 開始時間と終了時間（分）を時間（hour）に変換
        // START_HOUR=6 なので、minutesFromStart=0 -> 6時
        const startH = Math.floor(startMin / 60) + START_HOUR;
        const endH = Math.floor((endMin - 1) / 60) + START_HOUR; // 終了時刻の直前までが含まれる

        for (let h = startH; h <= endH; h++) {
          if (h >= START_HOUR && h < 20) {
            hours.add(h);
          }
        }
      });
    }

    // ソートして配列化
    const sortedHours = Array.from(hours).sort((a, b) => a - b);

    // Y座標のマッピングを作成
    const map = new Map<number, number>();
    let currentY = 0;
    sortedHours.forEach((h) => {
      map.set(h, currentY);
      currentY += currentHourHeight;
    });

    return {
      visibleHours: sortedHours,
      hourToY: map,
      totalHeight: currentY,
    };
  }, [programs, showAllDay, currentHourHeight]);

  // 全体の幅を計算 (各列の幅の合計 + 時間軸の幅)
  const totalWidth = channels.reduce((acc, ch) => acc + ch.width, 0) + currentTimeColWidth;

  // 番組が1件もない場合の表示
  const hasPrograms = channels.some((channel) => channel.programs.length > 0);

  if (!hasPrograms) {
    return (
      <div className="flex flex-col h-full w-full relative">
        <div className="flex-1 flex items-center justify-center p-8">
          <Empty>
            <EmptyMedia variant="icon">
              <TvMinimal className="size-6" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>表示する番組がありません</EmptyTitle>
              <EmptyDescription>
                選択された曜日やチャンネルに<br />一致する番組がありません。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
        <Toolbar />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* スクロールエリア */}
      <div className="flex-1 overflow-auto relative">
        <div
          className="relative min-w-full"
          style={{
            width: totalWidth,
            height: totalHeight + currentHeaderHeight,
          }}
        >
          {/* --- ヘッダー行（チャンネル/エリア名） --- */}
          <div 
            className="flex sticky top-0 z-98 bg-background border-b shadow-sm"
            style={{ height: currentHeaderHeight }}
          >
            {/* 左上の空白部分 (時間軸の上) も固定 */}
            <div
              className="sticky left-0 z-98 bg-primary-foreground border-r border-b shrink-0"
              style={{ width: currentTimeColWidth, height: currentHeaderHeight }}
            />

            {/* 各チャンネル列のヘッダー */}
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-center border-r font-bold text-[11px] md:text-sm text-muted-foreground truncate px-1 md:px-2"
                style={{ width: channel.width, height: currentHeaderHeight }}
              >
                {channel.name}
              </div>
            ))}
          </div>

          {/* --- メイングリッド（時間軸 + 番組部分） --- */}
          <div className="flex relative">
            
            {/* 時間軸 */}
            <div
              className="sticky left-0 z-97 bg-primary-foreground border-r text-[10px] md:text-xs text-muted-foreground"
              style={{ width: currentTimeColWidth, height: totalHeight }}
            >
              {/* 時間ラベル */}
              {visibleHours.map((hour) => {
                const top = hourToY.get(hour) || 0;
                return (
                  <div
                    key={hour}
                    className="absolute w-full border-b flex items-start justify-center pt-1"
                    style={{ 
                      top: top, 
                      height: currentHourHeight 
                    }}
                  >
                    {hour}
                  </div>
                );
              })}
            </div>

            {/* 番組表示エリア */}
            <div className="flex relative" style={{ height: totalHeight }}>
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="relative border-r"
                  style={{ width: channel.width, height: "100%" }}
                >
                  {/* 補助線 (1時間ごと) */}
                  {visibleHours.map((hour) => {
                    const top = hourToY.get(hour) || 0;
                    return (
                      <div
                        key={hour}
                        className="absolute w-full border-b pointer-events-none"
                        style={{ top: top, height: currentHourHeight }}
                      />
                    );
                  })}

                  {/* 番組カード */}
                  {channel.programs.map((prog) => {
                    // プログラムの表示位置を再計算
                    // prog.top は START_HOUR(6) からの絶対位置
                    const originalStartMin = prog.top / currentMinHeight;
                    const originalEndMin = (prog.top + prog.height) / currentMinHeight;
                    
                    // 表示範囲外（20時より前かつ全日帯OFF）の場合はクリップまたは非表示
                    let displayStartMin = originalStartMin;
                    let displayHeight = prog.height;

                    if (!showAllDay) {
                      const min20 = (20 - START_HOUR) * 60;
                      if (originalEndMin <= min20) return null; // 完全に範囲外
                      if (originalStartMin < min20) {
                        // 部分的に範囲外 -> クリップ
                        displayStartMin = min20;
                        displayHeight = (originalEndMin - min20) * currentMinHeight;
                      }
                    }

                    // 新しいY座標を計算
                    const startHour = Math.floor(displayStartMin / 60) + START_HOUR;
                    const startMinInHour = displayStartMin % 60;
                    
                    const baseY = hourToY.get(startHour);
                    if (baseY === undefined) return null; // 表示範囲外の時間帯は非表示

                    const newTop = baseY + startMinInHour * currentMinHeight;

                    return (
                      <ProgramCard
                        key={`${prog.id}-${prog.start_time}`}
                        program={prog}
                        mode={mode}
                        colWidth={currentColWidth}
                        ogPreview={prog.website_url ? ogPreviews?.[prog.website_url] : undefined}
                        style={{
                          top: newTop,
                          height: displayHeight - 2,
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Toolbar />
    </div>
  );
};