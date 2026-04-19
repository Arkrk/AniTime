"use client";

import React, { useMemo, useState, useEffect } from "react";
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
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { TvMinimal } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useDisplaySettings } from "@/hooks/use-display-settings";

type TimeTableProps = {
  programs: ProgramData[];
  mode?: LayoutMode;
  ogPreviews?: Record<string, React.ReactNode>;
};

export const TimeTable: React.FC<TimeTableProps> = ({ programs, mode = "area", ogPreviews }) => {
  const [mounted, setMounted] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { hiddenChannelIds, loaded } = useVisibilitySettings();
  const { showNewOnly } = useDisplaySettings();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const currentHourHeight = isDesktop ? HOUR_HEIGHT : MOBILE_HOUR_HEIGHT;
  const currentMinHeight = isDesktop ? MIN_HEIGHT : MOBILE_MIN_HEIGHT;
  const currentColWidth = isDesktop ? COL_WIDTH : MOBILE_COL_WIDTH;
  const currentTimeColWidth = isDesktop ? TIME_COL_WIDTH : MOBILE_TIME_COL_WIDTH;
  const currentHeaderHeight = isDesktop ? HEADER_HEIGHT : MOBILE_HEADER_HEIGHT;

  // チャンネル・番組のレイアウト計算
  const channels = useMemo(() => {
    let filteredPrograms = programs;
    if (showNewOnly) {
      filteredPrograms = programs.filter((p) => p.color !== 7 && p.color !== 8);
    }

    if (loaded && mode !== "week") {
      filteredPrograms = filteredPrograms.filter((p) => !hiddenChannelIds.includes(p.channel_id));
    }

    return calculateLayout(filteredPrograms, mode, {
      minHeight: currentMinHeight,
      colWidth: currentColWidth,
    });
  }, [programs, mode, hiddenChannelIds, loaded, showNewOnly, currentMinHeight, currentColWidth]);

  const scrollHourRef = React.useRef<number | null>(null);

  // 表示する時間帯（hour）のリストを計算
  const { visibleHours, hourToY, totalHeight } = useMemo(() => {
    const programHours = new Set<number>();

    programs.forEach((p) => {
      const { minutesFromStart: startMin } = calculatePosition(p.start_time);
      const { minutesFromStart: endMin } = calculatePosition(p.end_time);

      const startH = Math.floor(startMin / 60) + START_HOUR;
      const endH = Math.floor((endMin - 1) / 60) + START_HOUR;

      for (let h = startH; h <= endH; h++) {
        programHours.add(h);
      }
    });

    const hours = new Set<number>();
    let minLate = 30;
    let maxLate = -1;

    programHours.forEach((h) => {
      if (h >= START_HOUR && h < 20) {
        hours.add(h); // 全日帯 (6:00 - 19:59) は番組が存在する時間帯のみ
      }
      if (h >= 20 && h < END_HOUR) {
        if (h < minLate) minLate = h;
        if (h > maxLate) maxLate = h;
      }
    });

    // 深夜帯 (20:00 - 29:59) は番組が存在する時間帯とその間を表示
    if (minLate <= maxLate) {
      for (let h = minLate; h <= maxLate; h++) {
        hours.add(h);
      }
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
  }, [programs, currentHourHeight]);

  useEffect(() => {
    if (mounted && scrollRef.current) {
      const targetHour = scrollHourRef.current ?? 20;

      let targetY = 0;
      if (hourToY.has(targetHour)) {
        targetY = hourToY.get(targetHour)!;
      } else {
        let closestNewHour = Array.from(hourToY.keys())[0] || 20;
        let minDiffNew = Infinity;
        hourToY.forEach((y, curH) => {
          const diff = Math.abs(curH - targetHour);
          if (diff < minDiffNew) {
            minDiffNew = diff;
            closestNewHour = curH;
          }
        });
        targetY = hourToY.get(closestNewHour) || 0;
      }

      scrollRef.current.scrollTop = targetY;
    }
  }, [mounted, hourToY]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    let closestHour = 20;
    let minDiff = Infinity;

    hourToY.forEach((y, h) => {
      const diff = Math.abs(y - scrollTop);
      if (diff < minDiff) {
        minDiff = diff;
        closestHour = h;
      }
    });

    scrollHourRef.current = closestHour;
  };

  // 全体の幅を計算 (各列の幅の合計 + 時間軸の幅)
  const totalWidth = channels.reduce((acc, ch) => acc + ch.width, 0) + currentTimeColWidth;

  // 番組が1件もない場合の表示
  const hasPrograms = channels.some((channel) => channel.programs.length > 0);

  if (!hasPrograms) {
    return (
      <div 
        className="flex flex-col h-full w-full relative transition-opacity duration-200" 
        style={{ opacity: mounted ? 1 : 0 }}
      >
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
    <div 
      className="flex flex-col h-full w-full relative transition-opacity duration-200"
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {/* スクロールエリア */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto relative"
      >
        <div
          className="relative min-w-full min-h-full flex flex-col"
          style={{
            width: totalWidth,
          }}
        >
          {/* --- ヘッダー行（チャンネル/エリア名） --- */}
          <div 
            className="flex sticky top-0 z-98 bg-background border-b shadow-sm shrink-0"
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
          <div className="flex relative flex-1" style={{ minHeight: totalHeight }}>
            
            {/* 時間軸 */}
            <div
              className="sticky left-0 z-97 bg-primary-foreground border-r text-[10px] md:text-xs text-muted-foreground shrink-0"
              style={{ width: currentTimeColWidth }}
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
            <div className="flex relative flex-1">
              {/* 補助線 (1時間ごと) - 領域全体に引く */}
              <div className="absolute inset-0 pointer-events-none">
                {visibleHours.map((hour) => {
                  const top = hourToY.get(hour) || 0;
                  return (
                    <div
                      key={`bg-line-${hour}`}
                      className="absolute w-full border-b"
                      style={{ top: top, height: currentHourHeight }}
                    />
                  );
                })}
              </div>

              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="relative border-r shrink-0"
                  style={{ width: channel.width }}
                >
                  {/* 番組カード */}
                  {channel.programs.map((prog) => {
                    // プログラムの表示位置を再計算
                    // prog.top は START_HOUR(6) からの絶対位置
                    const originalStartMin = prog.top / currentMinHeight;
                    
                    let displayStartMin = originalStartMin;
                    let displayHeight = prog.height;

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