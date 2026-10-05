"use client";

import { useState, useEffect } from "react";
import { ProgramData } from "@/types/schedule";
import { Season } from "@/lib/get-seasons";
import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { getScheduleByDay } from "@/lib/get-schedule";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { ExportSavedPrograms } from "@/components/saved/ExportSavedPrograms";
import { SavedProgramList } from "@/components/saved/SavedProgramList";
import { SavedCount } from "@/components/saved/SavedCount";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { Spinner } from "@/components/ui/spinner";
import { calculatePosition } from "@/lib/format-time";

interface SavedContentProps {
  seasons: Season[];
  currentSeasonId: number;
  currentSeason: Season | null;
  currentParamsKey: string;
}

export function SavedContent({ seasons, currentSeasonId, currentSeason, currentParamsKey }: SavedContentProps) {
  const { isLoaded, savedIds } = useSavedPrograms();
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (savedIds.length === 0) {
      setPrograms([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    getScheduleByDay(0, currentSeasonId, savedIds).then((data) => {
      if (isMounted) {
        // 曜日・時間順にソートする
        const sortedData = [...data].sort((a, b) => {
          if (a.day_of_the_week !== b.day_of_the_week) {
            return a.day_of_the_week - b.day_of_the_week;
          }
          const posA = calculatePosition(a.start_time).minutesFromStart;
          const posB = calculatePosition(b.start_time).minutesFromStart;
          return posA - posB;
        });
        setPrograms(sortedData);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [isLoaded, savedIds, currentSeasonId]);

  return (
    <>
      <div className="shrink-0 p-4 border-b z-10 sticky top-0 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span>保存済み</span>
              <SavedCount />
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
            <ExportSavedPrograms programs={programs} currentSeason={currentSeason} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <LoadingOverlay currentParamsKey={currentParamsKey} eventName="loading-start">
          <div className="h-full w-full overflow-auto">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner className="size-8 text-muted-foreground" />
              </div>
            ) : (
              <SavedProgramList programs={programs} />
            )}
          </div>
        </LoadingOverlay>
      </div>
    </>
  );
}
