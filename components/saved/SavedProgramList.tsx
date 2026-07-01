"use client";

import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { useScrollReset } from "@/hooks/use-scroll-reset";
import { ProgramData, LayoutProgram } from "@/types/schedule";
import { ProgramCard } from "@/components/schedule/ProgramCard";
import { DAYS } from "@/lib/get-schedule";
import { calculatePosition, formatTime30 } from "@/lib/schedule-utils";
import { useMemo, useEffect } from "react";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Bookmark } from "lucide-react";
import React from "react";
import { Bar, BarChart, XAxis, LabelList } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const formatDuration = (minutes: number, format?: "text" | "colon") => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (format === "colon") {
    return `${h}:${String(m).padStart(2, "0")}`;
  }
  if (h > 0) return `${h}時間${m}分`;
  return `${m}分`;
};

const chartConfig = {
  minutes: {
    label: "視聴時間",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export const SavedProgramList = ({ programs, ogPreviews }: { programs: ProgramData[], ogPreviews?: Record<string, React.ReactNode> }) => {
  const { isSaved, isLoaded } = useSavedPrograms();
  const containerRef = useScrollReset<HTMLDivElement>();

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
    DAYS.forEach(day => dayMinutes.set(day.id, 0));

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

    // グラフ用データ
    const chartData = DAYS.map(day => {
      const dayProgs = programsByDay.get(day.id) || [];
      const lastProg = dayProgs[dayProgs.length - 1];
      return {
        day: day.label,
        minutes: dayMinutes.get(day.id) || 0,
        endTime: lastProg ? formatTime30(lastProg.end_time) : null,
      };
    });

    return {
      count,
      totalTime: formatDuration(totalMinutes),
      maxTime: formatDuration(maxMinutes),
      chartData,
    };
  }, [savedPrograms, programsByDay]);

  // コントロールバーの SavedCount コンポーネントへ件数を通知
  useEffect(() => {
    if (isLoaded) {
      const event = new CustomEvent("saved-count-change", { detail: stats.count });
      window.dispatchEvent(event);
    }
  }, [stats.count, isLoaded]);

  if (!isLoaded) {
    return null;
  }

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
    <div ref={containerRef} className="p-4 space-y-8 pb-20">
      {/* サマリーエリア */}
      <div className="bg-primary-foreground rounded-2xl border">
        <div className="flex flex-col md:flex-row md:divide-x divide-y md:divide-y-0 divide-border">
          {/* 合計視聴時間・最大視聴時間 */}
          <div className="flex flex-row md:flex-col justify-center divide-x md:divide-x-0 md:divide-y divide-border md:w-1/3">
            <div className="flex-1 p-3 flex items-center justify-center flex-col">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">1週間の合計視聴時間</div>
              <div className="text-xl md:text-2xl font-bold">{stats.totalTime}</div>
            </div>
            <div className="flex-1 p-3 flex items-center justify-center flex-col">
              <div className="text-xs md:text-sm text-muted-foreground mb-1">1日の最大視聴時間</div>
              <div className="text-xl md:text-2xl font-bold">{stats.maxTime}</div>
            </div>
          </div>

          {/* グラフ */}
          <div className="p-3 flex-1 flex flex-col justify-center">
            <div className="h-40 md:h-50 w-full">
              <ChartContainer config={chartConfig} className="aspect-auto h-full w-full">
                <BarChart data={stats.chartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tick={{ fill: "var(--muted-foreground)" }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        labelFormatter={(label) => `${label}曜日`}
                        formatter={(value, _, item) => (
                          <div className="flex flex-col gap-1 w-full text-xs">
                            <div className="flex items-center gap-1.5 justify-between w-full">
                              <span className="text-muted-foreground">視聴時間</span>
                              <span className="font-medium text-foreground tabular-nums">
                                {formatDuration(Number(value))}
                              </span>
                            </div>
                            {item.payload?.endTime && (
                              <div className="flex items-center gap-1.5 justify-between w-full">
                                <span className="text-muted-foreground">終了時間</span>
                                <span className="font-medium text-foreground tabular-nums">
                                  {item.payload.endTime}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        className="p-2.5"
                      />
                    }
                  />
                  <Bar
                    dataKey="minutes"
                    fill="var(--chart-2)"
                    radius={4}
                  >
                    <LabelList
                      dataKey="minutes"
                      position="top"
                      offset={8}
                      className="fill-foreground font-semibold md:text-sm"
                      formatter={(value: any) => formatDuration(Number(value), "colon")}
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </div>
      </div>

      {DAYS.map(day => {
        const dayPrograms = programsByDay.get(day.id) || [];
        if (dayPrograms.length === 0) return null;

        return (
          <div key={day.id}>
            <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center gap-2">
              <span className="text-2xl">{day.label}</span>
              <span className="text-sm text-muted-foreground font-normal">曜日</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                    ogPreview={program.website_url ? ogPreviews?.[program.website_url] : undefined}
                    className="relative! top-0! left-0! w-full! h-full!"
                    style={{ width: "100%", height: "100%" }}
                    forceDesktopSize={true}
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
