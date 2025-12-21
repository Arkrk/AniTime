import React, { useMemo } from "react";
import { clsx } from "clsx";
import { ProgramData } from "@/types/schedule";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  calculateLayout,
  formatTime30,
  START_HOUR,
  END_HOUR,
  HOUR_HEIGHT,
  COL_WIDTH,
} from "@/lib/schedule-utils";

type TimeTableProps = {
  programs: ProgramData[];
};

export const TimeTable: React.FC<TimeTableProps> = ({ programs }) => {
  // データを元にレイアウトを計算（メモ化して再計算を防ぐ）
  const channels = useMemo(() => calculateLayout(programs), [programs]);

  // 全体の高さ (20時〜29時 = 9時間)
  const totalHours = END_HOUR - START_HOUR;
  const totalHeight = totalHours * HOUR_HEIGHT;

  return (
    <div className="flex flex-col h-full border bg-white overflow-hidden rounded-md shadow-sm">
      {/* ヘッダーとコンテンツを含むスクロール領域 */}
      <div className="flex flex-1 overflow-auto relative">
        
        {/* 左側：時間軸 (Sticky) */}
        <div className="sticky left-0 z-30 bg-gray-50 border-r w-8 shrink-0">
          {/* 左上の空白セル */}
          <div className="sticky top-0 h-10 bg-gray-100 border-b z-40" />
          
          {/* 時間メモリ */}
          <div style={{ height: totalHeight }} className="relative bg-gray-50">
            {Array.from({ length: totalHours }).map((_, i) => {
              const hour = START_HOUR + i;
              const displayHour = hour; // 0時は24時と表示
              
              return (
                <div
                  key={hour}
                  className="absolute w-full text-center text-xs text-gray-500 font-medium border-b border-gray-200"
                  style={{
                    top: i * HOUR_HEIGHT,
                    height: HOUR_HEIGHT,
                  }}
                >
                  <span className="block mt-1">
                    {displayHour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右側：番組表本体 */}
        <div className="flex">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="shrink-0 border-r border-gray-200 relative"
              style={{ width: channel.width }}
            >
              {/* チャンネル名ヘッダー (Sticky) */}
              <div
                className="sticky top-0 z-20 flex items-center justify-center bg-gray-100 border-b border-gray-300 font-bold text-sm text-gray-700 h-10 px-2 truncate shadow-sm"
                title={channel.name}
              >
                {channel.name}
              </div>

              {/* 番組エリア背景（グリッド線） */}
              <div style={{ height: totalHeight }} className="relative bg-white">
                {Array.from({ length: totalHours }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-b border-gray-100"
                    style={{
                      top: i * HOUR_HEIGHT,
                      height: HOUR_HEIGHT,
                    }}
                  />
                ))}

                {/* 番組カード配置 */}
                {channel.programs.map((prog) => (
                  <div
                    key={`${prog.id}-${prog.start_time}`}
                    className={clsx(
                      "absolute p-1 overflow-hidden rounded transition-all cursor-pointer group",
                      "border hover:z-10 hover:shadow-lg hover:scale-[1.02]",
                      // 色設定: DBのcolor値に応じてクラスを切り替える場合
                      getColorClass(prog.color)
                    )}
                    style={{
                      top: prog.top,
                      height: prog.height - 2, // ボーダー重複を避けるマージン
                      left: prog.laneIndex * COL_WIDTH + 2,
                      width: COL_WIDTH - 4,
                    }}
                  >
                    <div className="flex flex-col h-full">
                      {/* 開始日表示 */}
                      {prog.start_date && (
                         <span className="text-gray-600 text-xs w-fit rounded">
                           {format(parseISO(prog.start_date), "M月d日スタート", { locale: ja })}
                         </span>
                      )}
                      {/* 時刻表示 */}
                      <span className="font-mono text-xs opacity-70 leading-none mb-0.5 tracking-tight">
                        {formatTime30(prog.start_time)}～{formatTime30(prog.end_time)}
                      </span>
                      {/* 番組名 */}
                      <span className="font-bold text-[13px] leading-tight line-clamp-3 group-hover:line-clamp-none">
                        {prog.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {/* データがない場合のプレースホルダー */}
          {channels.length === 0 && (
            <div className="p-10 text-gray-400 text-sm">
              表示する番組がありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ヘルパー: 色クラスの決定
function getColorClass(colorId?: number) {
  // DBのcolor値(1~8)に対応するTailwindクラス
  const colors = [
    "bg-gray-100 border-gray-200 text-gray-800",   // default
    "bg-red-100 border-red-200 text-red-900",      // 1
    "bg-blue-100 border-blue-200 text-blue-900",     // 2
    "bg-green-100 border-green-200 text-green-900",   // 3
    "bg-yellow-100 border-yellow-200 text-yellow-900", // 4
    "bg-purple-100 border-purple-200 text-purple-900", // 5
    "bg-pink-100 border-pink-200 text-pink-900",     // 6
    "bg-orange-100 border-orange-200 text-orange-900", // 7
    "bg-teal-100 border-teal-200 text-teal-900",     // 8
  ];
  return colors[colorId ? colorId - 1 : 0] || colors[0];
}

// ヘルパー: 時刻表示の整形 (秒をカット)
function formatTime(timeStr: string) {
  return timeStr.substring(0, 5);
}