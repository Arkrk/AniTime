"use client";

import React, { useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { ja } from "date-fns/locale";
import { cn } from "cn";
import { ProgramData } from "@/types/schedule";
import { Season } from "@/lib/get-seasons";
import { calculateLayout, calculateVisibleHours } from "@/lib/schedule-layout";
import { formatTime30, START_HOUR } from "@/lib/format-time";
import { getProgramColorClass } from "@/lib/colors";

// 画像出力用のレイアウト定数
export const EXPORT_HOUR_HEIGHT = 240; // 1時間あたりの高さ(px)
export const EXPORT_MIN_HEIGHT = 4; // 1分あたりのpx数
export const EXPORT_COL_WIDTH = 160; // 1列(レーン)の幅(px)
export const EXPORT_TIME_COL_WIDTH = 35; // 時間軸列の幅
export const EXPORT_HEADER_HEIGHT = 35; // 曜日ヘッダー行の高さ

type SavedTimeTableExportProps = {
  programs: ProgramData[];
  currentSeason?: Season | null;
  ref?: React.Ref<HTMLDivElement>;
};

/**
 * 保存済み番組表をPNG画像として出力するための静的な番組表
 */
export const SavedTimeTableExport: React.FC<SavedTimeTableExportProps> = ({ programs, ref }) => {
  // 曜日ごとの列レイアウト
  const channels = useMemo(
    () =>
      calculateLayout(programs, "week", {
        minHeight: EXPORT_MIN_HEIGHT,
        colWidth: EXPORT_COL_WIDTH,
      }),
    [programs]
  );

  // 表示する時間帯
  const { visibleHours, hourToY, totalHeight } = useMemo(
    () => calculateVisibleHours(programs, EXPORT_HOUR_HEIGHT),
    [programs]
  );

  const gridWidth = channels.reduce((acc, ch) => acc + ch.width, 0) + EXPORT_TIME_COL_WIDTH;

  return (
    <div
      ref={ref}
      className="bg-background text-foreground flex flex-col gap-4"
      style={{ width: gridWidth }}
    >

      {/* 番組表本体 */}
      <div style={{ width: gridWidth }}>
        {/* 曜日ヘッダー */}
        <div className="flex bg-primary-foreground border-b" style={{ height: EXPORT_HEADER_HEIGHT }}>
          <div className="border-r shrink-0" style={{ width: EXPORT_TIME_COL_WIDTH }} />
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center justify-center border-r last:border-r-0 font-bold text-sm text-muted-foreground shrink-0"
              style={{ width: channel.width }}
            >
              {channel.name}
            </div>
          ))}
        </div>

        {/* 時間軸 + 番組 */}
        <div className="flex relative" style={{ height: totalHeight }}>
          {/* 時間軸 */}
          <div
            className="relative bg-primary-foreground border-r text-xs text-muted-foreground shrink-0"
            style={{ width: EXPORT_TIME_COL_WIDTH }}
          >
            {visibleHours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-b flex items-start justify-center pt-1"
                style={{ top: hourToY.get(hour) || 0, height: EXPORT_HOUR_HEIGHT }}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* 番組表示エリア */}
          <div className="flex relative flex-1">
            {/* 補助線 (1時間ごと) */}
            <div className="absolute inset-0">
              {visibleHours.map((hour) => (
                <div
                  key={`bg-line-${hour}`}
                  className="absolute w-full border-b"
                  style={{ top: hourToY.get(hour) || 0, height: EXPORT_HOUR_HEIGHT }}
                />
              ))}
            </div>

            {channels.map((channel) => (
              <div
                key={channel.id}
                className="relative border-r last:border-r-0 shrink-0"
                style={{ width: channel.width }}
              >
                {channel.programs.map((prog) => {
                  // prog.top は START_HOUR からの絶対位置のため、表示する時間帯に合わせて再計算する
                  const startMin = prog.top / EXPORT_MIN_HEIGHT;
                  const startHour = Math.floor(startMin / 60) + START_HOUR;
                  const baseY = hourToY.get(startHour);
                  if (baseY === undefined) return null; // 表示範囲外の時間帯は非表示

                  const top = baseY + (startMin % 60) * EXPORT_MIN_HEIGHT;
                  const stackCount = prog.stackedPrograms?.length ?? 1;
                  const startDate = prog.start_date ? parseISO(prog.start_date) : null;

                  return (
                    <div
                      key={`${prog.id}-${prog.start_time}`}
                      className={cn(
                        "absolute p-1 rounded overflow-hidden flex flex-col border",
                        getProgramColorClass(prog.color)
                      )}
                      style={{
                        top,
                        height: prog.height - 2,
                        left: prog.laneIndex * EXPORT_COL_WIDTH + 2,
                        width: EXPORT_COL_WIDTH - 4,
                      }}
                    >
                      <span className="text-xs font-semibold truncate leading-[1.15] shrink-0">
                        {prog.channel_name}
                      </span>
                      {startDate && isValid(startDate) && (
                        <span className="text-xs leading-[1.15] shrink-0">
                          {format(startDate, "y年M月d日～", { locale: ja })}
                        </span>
                      )}
                      <span className="text-xs tracking-tight shrink-0 opacity-70">
                        {formatTime30(prog.start_time)}～{formatTime30(prog.end_time, prog.start_time)}
                      </span>
                      <span className="text-[13px] font-bold leading-tight">
                        {prog.name}
                        {stackCount > 1 && (
                          <span className="ml-1 text-[11px] font-normal opacity-70">ほか{stackCount - 1}件</span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

