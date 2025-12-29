"use client";

import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { ProgramData, LayoutProgram } from "@/types/schedule";
import { ProgramCard } from "@/components/schedule/ProgramCard";
import { DAYS } from "@/lib/get-schedule";
import { calculatePosition } from "@/lib/schedule-utils";
import { useMemo } from "react";

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

  if (savedPrograms.length === 0) {
    return <div className="p-8 text-center text-gray-500">保存された番組はありません。</div>;
  }

  return (
    <div className="p-4 space-y-8 pb-20">
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
