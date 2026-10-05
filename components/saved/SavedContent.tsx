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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table2 } from "lucide-react";
import { TimeTable } from "@/components/schedule/TimeTable";
import { OGImageFallback } from "@/components/works/OGImageFallback";
import React, { useMemo } from "react";

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
  const [viewMode, setViewMode] = useState<"list" | "timetable">("list");

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

  const ogPreviews = useMemo(() => {
    const map: Record<number, React.ReactNode> = {};
    programs.forEach(p => {
      if (p.og_image_url) {
        map[p.id] = (
          <div className="w-full relative overflow-hidden bg-muted aspect-[1.91/1] rounded-lg border">
            <OGImageFallback src={p.og_image_url} />
          </div>
        );
      }
    });
    return map;
  }, [programs]);

  return (
    <>
      <div className="shrink-0 p-4 border-b z-10 sticky top-0 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span className="max-[390px]:hidden">保存済み</span>
              <span className="max-[430px]:hidden"><SavedCount /></span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "timetable")}>
              <TabsList>
                <TabsTrigger value="list" title="グリッドビュー">
                  <LayoutGrid />
                </TabsTrigger>
                <TabsTrigger value="timetable" title="番組表ビュー">
                  <Table2 />
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <ExportSavedPrograms programs={programs} currentSeason={currentSeason} />
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <LoadingOverlay currentParamsKey={currentParamsKey} eventName="loading-start">
          <div className={`h-full w-full relative ${viewMode === "list" ? "overflow-auto" : "overflow-hidden"}`}>
            {isLoading && programs.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <Spinner className="size-8 text-muted-foreground" />
              </div>
            ) : (
              viewMode === "list" ? (
                <SavedProgramList programs={programs} />
              ) : (
                <TimeTable programs={programs} mode="week" ogPreviews={ogPreviews} />
              )
            )}
          </div>
        </LoadingOverlay>
      </div>
    </>
  );
}
