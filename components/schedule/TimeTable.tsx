"use client";

import React, { useMemo } from "react";
import { ProgramData, LayoutMode } from "@/types/schedule";
import {
  calculateLayout,
  START_HOUR,
  END_HOUR,
  HOUR_HEIGHT,
} from "@/lib/schedule-utils";
import { ProgramCard } from "./ProgramCard";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";

const TIME_COL_WIDTH = 35;
const HEADER_HEIGHT = 35;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;

type TimeTableProps = {
  programs: ProgramData[];
  mode?: LayoutMode;
};

export const TimeTable: React.FC<TimeTableProps> = ({ programs, mode = "area" }) => {
  const { hiddenAreaIds, hiddenChannelIds, loaded } = useVisibilitySettings();

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

  // 全体の幅を計算 (各列の幅の合計 + 時間軸の幅)
  const totalWidth = channels.reduce((acc, ch) => acc + ch.width, 0) + TIME_COL_WIDTH;
  // 表示する時間数（ループ用）
  const totalHours = END_HOUR - START_HOUR;

  return (
    <div className="h-full w-full overflow-auto bg-white relative">
      <div
        className="relative min-w-full"
        style={{
          width: totalWidth,
          height: TOTAL_HEIGHT + HEADER_HEIGHT,
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
            style={{ width: TIME_COL_WIDTH, height: TOTAL_HEIGHT }}
          >
            {/* 時間ラベル */}
            {Array.from({ length: totalHours }).map((_, i) => {
              const hour = START_HOUR + i;
              return (
                <div
                  key={i}
                  className="absolute w-full border-b border-gray-200 flex items-start justify-center pt-1"
                  style={{ 
                    top: i * HOUR_HEIGHT, 
                    height: HOUR_HEIGHT 
                  }}
                >
                  {hour}
                </div>
              );
            })}
          </div>

          {/* 番組表示エリア */}
          <div className="flex relative" style={{ height: TOTAL_HEIGHT }}>
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="relative border-r border-gray-100"
                style={{ width: channel.width, height: "100%" }}
              >
                {/* 補助線 (1時間ごと) */}
                {Array.from({ length: totalHours }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-gray-100 pointer-events-none"
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                ))}

                {/* 番組カード */}
                {channel.programs.map((prog) => (
                  <ProgramCard
                    key={`${prog.id}-${prog.start_time}`}
                    program={prog}
                    mode={mode}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};