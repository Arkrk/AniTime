import { Suspense } from "react";
import { getScheduleByDay, getWeekScheduleByChannel, getChannels } from "@/lib/get-schedule";
import { getSeasons } from "@/lib/get-seasons";
import { TimeTable } from "@/components/schedule/TimeTable";
import { DayTabs } from "@/components/schedule/DayTabs";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { DisplaySettings } from "@/components/schedule/DisplaySettings";
import { ChannelNavigator } from "@/components/schedule/ChannelNavigator";
import { LayoutMode, ProgramData } from "@/types/schedule";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // viewパラメータの取得
  const viewParam = params.view as string;
  let layoutMode: LayoutMode;
  if (viewParam === "week") {
    layoutMode = "week";
  } else if (viewParam === "channel") {
    layoutMode = "channel";
  } else {
    layoutMode = "area";
  }
  
  // allDayパラメータの取得
  const showAllDay = params.allDay === "true";
  const showSavedOnly = params.savedOnly === "true";
  
  // 1. シーズン一覧を取得
  const seasons = await getSeasons();
  
  // 2. シーズンIDの決定
  // URLパラメータがあるか？ なければ最新(配列の0番目)のIDを使う
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : 0;
  const seasonParam = params.season;
  const currentSeasonId = seasonParam ? Number(seasonParam) : latestSeasonId;

  // 3. データ取得分岐
  let programs: ProgramData[] = [];
  let channels: any[] = []; // weekモード用
  let currentChannelId = 0;
  let validDay = 1;

  if (layoutMode === "week") {
    // 週間番組表モード
    channels = await getChannels();
    const defaultChannelId = channels.length > 0 ? channels[0].id : 0;
    const channelParam = params.channel;
    currentChannelId = channelParam ? Number(channelParam) : defaultChannelId;
    programs = await getWeekScheduleByChannel(currentSeasonId, currentChannelId);
  } else {
    // 通常モード
    const dayParam = params.day;
    const currentDay = dayParam ? Number(dayParam) : 1;
    validDay = (currentDay >= 1 && currentDay <= 7) ? currentDay : 1;
    programs = await getScheduleByDay(validDay, currentSeasonId);
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* コントロールバー */}
      <div className="shrink-0 p-4 border-b z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-4">
            <h1 className="text-lg font-bold">番組表</h1>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
            <div className="flex items-center gap-2">
              {layoutMode === "week" ? (
                <ChannelNavigator channels={channels} currentChannelId={currentChannelId} />
              ) : (
                <DayTabs currentDay={validDay} />
              )}
              <DisplaySettings />
            </div>
          </div>
        </div>
      </div>

      {/* 番組表エリア  */}
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={<LoadingSkeleton />}>
          <TimeTable programs={programs} mode={layoutMode} showAllDay={showAllDay} showSavedOnly={showSavedOnly} />
        </Suspense>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center animate-pulse">
      読み込み中...
    </div>
  );
}