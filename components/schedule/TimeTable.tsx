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
} from "@/lib/schedule-utils";
import { ProgramCard } from "./ProgramCard";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";

const TIME_COL_WIDTH = 35;
const HEADER_HEIGHT = 35;

type TimeTableProps = {
  programs: ProgramData[];
  mode?: LayoutMode;
  showAllDay: boolean;
};

export const TimeTable: React.FC<TimeTableProps> = ({ programs, mode = "area", showAllDay }) => {
  const { hiddenAreaIds, hiddenChannelIds, loaded } = useVisibilitySettings();

  // チャンネル・番組のレイアウト計算
  const channels = useMemo(() => {
    const allChannels = calculateLayout(programs, mode);
    if (!loaded) return allChannels;

    return allChannels.filter((ch) => {
      if (mode === "area") {
        return !hiddenAreaIds.includes(ch.id);
      } else {
        return !hiddenChannelIds.includes(ch.id);
      }
    });
  }, [programs, mode, hiddenAreaIds, hiddenChannelIds, loaded]);

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
      currentY += HOUR_HEIGHT;
    });

    return {
      visibleHours: sortedHours,
      hourToY: map,
      totalHeight: currentY,
    };
  }, [programs, showAllDay]);

  // 全体の幅を計算 (各列の幅の合計 + 時間軸の幅)
  const totalWidth = channels.reduce((acc, ch) => acc + ch.width, 0) + TIME_COL_WIDTH;

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* スクロールエリア */}
      <div className="flex-1 overflow-auto relative">
        <div
          className="relative min-w-full"
          style={{
            width: totalWidth,
            height: totalHeight + HEADER_HEIGHT,
          }}
        >
          {/* --- ヘッダー行（チャンネル/エリア名） --- */}
          <div 
            className="flex sticky top-0 z-98 bg-white border-b shadow-sm"
            style={{ height: HEADER_HEIGHT }}
          >
            {/* 左上の空白部分 (時間軸の上) も固定 */}
            <div
              className="sticky left-0 z-98 bg-gray-50 border-r border-b shrink-0"
              style={{ width: TIME_COL_WIDTH, height: HEADER_HEIGHT }}
            />

            {/* 各チャンネル列のヘッダー */}
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-center border-r border-b bg-white font-bold text-sm text-gray-700 truncate px-2"
                style={{ width: channel.width, height: HEADER_HEIGHT }}
              >
                {channel.name}
              </div>
            ))}
          </div>

          {/* --- メイングリッド（時間軸 + 番組部分） --- */}
          <div className="flex relative">
            
            {/* 時間軸 */}
            <div
              className="sticky left-0 z-20 bg-gray-50 border-r text-xs text-gray-500 font-mono"
              style={{ width: TIME_COL_WIDTH, height: totalHeight }}
            >
              {/* 時間ラベル */}
              {visibleHours.map((hour) => {
                const top = hourToY.get(hour) || 0;
                return (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-gray-200 flex items-start justify-center pt-1"
                    style={{ 
                      top: top, 
                      height: HOUR_HEIGHT 
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
                  className="relative border-r border-gray-100"
                  style={{ width: channel.width, height: "100%" }}
                >
                  {/* 補助線 (1時間ごと) */}
                  {visibleHours.map((hour) => {
                    const top = hourToY.get(hour) || 0;
                    return (
                      <div
                        key={hour}
                        className="absolute w-full border-b border-gray-100 pointer-events-none"
                        style={{ top: top, height: HOUR_HEIGHT }}
                      />
                    );
                  })}

                  {/* 番組カード */}
                  {channel.programs.map((prog) => {
                    // プログラムの表示位置を再計算
                    // prog.top は START_HOUR(6) からの絶対位置
                    const originalStartMin = prog.top / MIN_HEIGHT;
                    const originalEndMin = (prog.top + prog.height) / MIN_HEIGHT;
                    
                    // 表示範囲外（20時より前かつ全日帯OFF）の場合はクリップまたは非表示
                    let displayStartMin = originalStartMin;
                    let displayHeight = prog.height;

                    if (!showAllDay) {
                      const min20 = (20 - START_HOUR) * 60;
                      if (originalEndMin <= min20) return null; // 完全に範囲外
                      if (originalStartMin < min20) {
                        // 部分的に範囲外 -> クリップ
                        displayStartMin = min20;
                        displayHeight = (originalEndMin - min20) * MIN_HEIGHT;
                      }
                    }

                    // 新しいY座標を計算
                    const startHour = Math.floor(displayStartMin / 60) + START_HOUR;
                    const startMinInHour = displayStartMin % 60;
                    
                    const baseY = hourToY.get(startHour);
                    if (baseY === undefined) return null; // 安全策

                    const newTop = baseY + startMinInHour * MIN_HEIGHT;

                    return (
                      <ProgramCard
                        key={`${prog.id}-${prog.start_time}`}
                        program={prog}
                        mode={mode}
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
    </div>
  );
};