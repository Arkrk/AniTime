import { Suspense } from "react";
import { getScheduleByDay } from "@/lib/get-schedule";
import { getSeasons } from "@/lib/get-seasons";
import { TimeTable } from "@/components/schedule/TimeTable";
import { DayTabs } from "@/components/schedule/DayTabs";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { ViewSelector } from "@/components/schedule/ViewSelector";
import { LayoutMode } from "@/types/schedule";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // viewパラメータの取得
  const viewParam = params.view as string;
  const layoutMode: LayoutMode = (viewParam === "channel") ? "channel" : "area";
  
  // 1. シーズン一覧を取得
  const seasons = await getSeasons();
  
  // 2. シーズンIDの決定
  // URLパラメータがあるか？ なければ最新(配列の0番目)のIDを使う
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : 0;
  const seasonParam = params.season;
  const currentSeasonId = seasonParam ? Number(seasonParam) : latestSeasonId;

  // 3. 曜日の決定
  const dayParam = params.day;
  const currentDay = dayParam ? Number(dayParam) : 1;
  const validDay = (currentDay >= 1 && currentDay <= 7) ? currentDay : 1;

  // 4. 番組データ取得
  const programs = await getScheduleByDay(validDay, currentSeasonId);

  return (
    // 親(layoutのmain)が flex-col なので、ここで h-full を指定して高さを埋める
    <div className="flex flex-col h-full w-full">
      
      {/* コントロールバー */}
      <div className="shrink-0 p-4 border-b bg-white z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
            <DayTabs currentDay={validDay} />
          </div>
          <ViewSelector />
        </div>
      </div>

      {/* 番組表エリア  */}
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<LoadingSkeleton />}>
          <TimeTable programs={programs} mode={layoutMode} />
        </Suspense>
      </div>
      
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 animate-pulse">
      読み込み中...
    </div>
  );
}