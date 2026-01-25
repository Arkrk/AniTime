import { Suspense } from "react";
import { getScheduleByDay } from "@/lib/get-schedule";
import { getSeasons } from "@/lib/get-seasons";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { SavedProgramList } from "@/components/saved/SavedProgramList";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function SavedPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // 1. シーズン一覧を取得
  const seasons = await getSeasons();
  
  // 2. シーズンIDの決定
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : 0;
  const seasonParam = params.season;
  const currentSeasonId = seasonParam ? Number(seasonParam) : latestSeasonId;

  // 3. 全番組データ取得 (day=0 で全曜日取得)
  const programs = await getScheduleByDay(0, currentSeasonId);

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* コントロールバー */}
      <div className="shrink-0 p-4 border-b z-10 sticky top-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold">保存済み</h1>
          </div>
          <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
        </div>
      </div>

      {/* 番組リストエリア */}
      <div className="flex-1 overflow-auto">
        <Suspense fallback={<LoadingSkeleton />}>
          <SavedProgramList programs={programs} />
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
