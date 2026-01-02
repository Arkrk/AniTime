"use client";

import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { ProgramData, LayoutProgram } from "@/types/schedule";
import { ProgramCard } from "@/components/schedule/ProgramCard";
import { DAYS } from "@/lib/get-schedule";
import { calculatePosition } from "@/lib/schedule-utils";
import { useMemo } from "react";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Bookmark } from "lucide-react";

export const SavedProgramList = ({ programs }: { programs: ProgramData[] }) => {
  const { isSaved } = useSavedPrograms();

  const savedPrograms = useMemo(() => {
    return programs.filter(p => isSaved(String(p.id)));
  }, [programs, isSaved]);

  // 曜日ごとにグループ化
  const programsByDay = useMemo(() => {
    const grouped = new Map<number, ProgramData[]>();
    DAYS.forEach(day => grouped.set(day.id, []));
    
    savedPrograms.forEach(p => {
      const list = grouped.get(p.day_of_the_week);
      if (list) list.push(p);
    });

    // 30時間制でソート (20:00開始基準)
    grouped.forEach((list) => {
      list.sort((a, b) => {
        const posA = calculatePosition(a.start_time).minutesFromStart;
        const posB = calculatePosition(b.start_time).minutesFromStart;
        return posA - posB;
      });
    });
    
    return grouped;
  }, [savedPrograms]);

  // 統計情報の計算
  const stats = useMemo(() => {
    const count = savedPrograms.length;
    let totalMinutes = 0;
    const dayMinutes = new Map<number, number>();

    savedPrograms.forEach(prog => {
      const { minutesFromStart: startMin } = calculatePosition(prog.start_time);
      const { minutesFromStart: endMin } = calculatePosition(prog.end_time);
      // 日またぎ対応: 終了時刻が開始時刻より前の場合は翌日とみなす
      const safeEndMin = endMin < startMin ? endMin + 24 * 60 : endMin;
      const duration = safeEndMin - startMin;
      
      totalMinutes += duration;
      
      // 曜日ごとの集計
      const current = dayMinutes.get(prog.day_of_the_week) || 0;
      dayMinutes.set(prog.day_of_the_week, current + duration);
    });

    // 最大値を求める
    let maxMinutes = 0;
    for (const minutes of dayMinutes.values()) {
      if (minutes > maxMinutes) maxMinutes = minutes;
    }

    const formatDuration = (minutes: number) => {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      if (h > 0) return `${h}時間${m}分`;
      return `${m}分`;
    };

    return {
      count,
      totalTime: formatDuration(totalMinutes),
      maxTime: formatDuration(maxMinutes)
    };
  }, [savedPrograms]);

  if (savedPrograms.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Empty>
          <EmptyMedia variant="icon">
            <Bookmark className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>保存済みの番組はありません</EmptyTitle>
            <EmptyDescription>
              番組表から気になる番組を保存すると<br />ここに一覧表示されます。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8 pb-20">
      {/* 統計情報 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <div className="text-xs text-gray-500 mb-1 font-bold">保存済み数</div>
          <div className="text-2xl font-bold text-slate-900">{stats.count}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <div className="text-xs text-gray-500 mb-1 font-bold">1週間の合計視聴時間</div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalTime}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg border text-center">
          <div className="text-xs text-gray-500 mb-1 font-bold">1日の最大視聴時間</div>
          <div className="text-2xl font-bold text-slate-900">{stats.maxTime}</div>
        </div>
      </div>

      {DAYS.map(day => {
        const dayPrograms = programsByDay.get(day.id) || [];
        if (dayPrograms.length === 0) return null;

        return (
          <div key={day.id}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <span className="text-2xl">{day.label}</span>
              <span className="text-sm text-gray-500 font-normal">曜日</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {dayPrograms.map(program => (
                <div key={program.id} className="relative h-28">
                  <ProgramCard 
                    program={{
                      ...program,
                      top: 0,
                      height: 112, // h-28 = 112px
                      laneIndex: 0,
                      isNextDay: false
                    } as LayoutProgram}
                    mode="area"
                    className="relative! top-0! left-0! w-full! h-full!"
                    style={{ width: "100%", height: "100%" }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
