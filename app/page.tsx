import { Suspense } from "react";
import { getScheduleByDay, getWeekScheduleByChannel, getWeekScheduleByArea, getSeasonSchedule } from "@/lib/get-schedule";
import { resolveDayId } from "@/lib/format-days";
import { getChannels, getAreas } from "@/lib/get-channels";
import { getSeasons, resolveSeasonId } from "@/lib/get-seasons";
import { TimeTable } from "@/components/schedule/TimeTable";
import { DayTabs } from "@/components/schedule/DayTabs";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { DisplaySettings } from "@/components/schedule/DisplaySettings";
import { ChannelNavigator } from "@/components/schedule/ChannelNavigator";
import { AreaNavigator } from "@/components/schedule/AreaNavigator";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { Spinner } from "@/components/ui/spinner";
import { LayoutMode, ProgramData } from "@/types/schedule";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";
import { Toolbar } from "@/components/schedule/Toolbar";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams;

  // viewとgroupingパラメータの取得
  const viewParam = (params.view as string) || "default";
  const groupingParam = (params.grouping as string) || "area";

  // LayoutModeの決定
  let layoutMode: LayoutMode;
  if (viewParam === "week") {
    layoutMode = "week";
  } else if (viewParam === "season") {
    layoutMode = "season";
  } else if (groupingParam === "channel") {
    layoutMode = "channel";
  } else { // groupingParam === "area"
    layoutMode = "area";
  }

  // シーズン、チャンネル、エリアの一覧を取得
  const [seasons, channels, areas] = await Promise.all([
    getSeasons(),
    getChannels(),
    getAreas()
  ]);

  // シーズンIDの決定
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : 0;
  const currentSeasonId = resolveSeasonId(params.season, seasons, latestSeasonId);

  // 曜日IDの決定
  const currentDay = resolveDayId(params.day, 1);
  const validDay = currentDay;

  // チャンネルID・エリアIDの決定
  const defaultChannelId = channels.length > 0 ? channels[0].id : 0;
  const currentChannelId = params.channel ? Number(params.channel) : defaultChannelId;
  const defaultAreaId = areas.length > 0 ? areas[0].id : 0;
  const currentAreaId = params.area ? Number(params.area) : defaultAreaId;

  // renderKeyを生成
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach(v => sp.append(key, v));
    } else if (val !== undefined) {
      sp.append(key, val);
    }
  }
  const currentParamsKey = sp.toString();

  // コントロール表示の判定
  const showSeasonSelector = viewParam !== "season";
  const showDayTabs = viewParam !== "week";
  const showChannelNavigator = (viewParam === "week" && groupingParam === "channel") || (viewParam === "season");
  const showAreaNavigator = viewParam === "week" && groupingParam === "area";

  return (
    <div className="flex flex-col h-full w-full">
      {/* コントロールバー */}
      <div className="shrink-0 p-4 border-b z-10">
        <div className="flex flex-col min-[360px]:flex-row items-center justify-between gap-4">
          <div className="hidden min-[360px]:flex items-center gap-4">
            <h1 className="text-lg font-bold shrink-0">番組表</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {showSeasonSelector && (
              <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} />
            )}
            <div className="flex items-center gap-2 max-w-full overflow-x-auto">
              {showAreaNavigator && (
                <AreaNavigator areas={areas} currentAreaId={currentAreaId} />
              )}
              {showChannelNavigator && (
                <ChannelNavigator channels={channels} currentChannelId={currentChannelId} />
              )}
              {showDayTabs && (
                <DayTabs currentDay={validDay} />
              )}
              <DisplaySettings channels={channels} areas={areas} seasons={seasons} />
            </div>
          </div>
        </div>
      </div>

      {/* 番組表エリア  */}
      <div className="flex-1 overflow-hidden relative">
        <LoadingOverlay currentParamsKey={currentParamsKey} eventName="loading-start">
          <Suspense fallback={<LoaderScreen />}>
            <ScheduleDataWrapper
              viewParam={viewParam}
              groupingParam={groupingParam}
              layoutMode={layoutMode}
              currentSeasonId={currentSeasonId}
              currentChannelId={currentChannelId}
              currentAreaId={currentAreaId}
              validDay={validDay}
              seasons={seasons}
            />
            <Toolbar />
          </Suspense>
        </LoadingOverlay>
      </div>
    </div>
  );
}

async function ScheduleDataWrapper({
  viewParam,
  groupingParam,
  layoutMode,
  currentSeasonId,
  currentChannelId,
  currentAreaId,
  validDay,
  seasons
}: {
  viewParam: string;
  groupingParam: string;
  layoutMode: LayoutMode;
  currentSeasonId: number;
  currentChannelId: number;
  currentAreaId: number;
  validDay: number;
  seasons: any[];
}) {
  let programs: ProgramData[] = [];

  if (viewParam === "week") {
    if (groupingParam === "area") {
      programs = await getWeekScheduleByArea(currentSeasonId, currentAreaId);
    } else { // groupingParam === "channel"
      programs = await getWeekScheduleByChannel(currentSeasonId, currentChannelId);
    }
  } else if (viewParam === "season") {
    programs = await getSeasonSchedule(currentChannelId, validDay, seasons);
  } else { // viewParam === "default"
    programs = await getScheduleByDay(validDay, currentSeasonId);
  }

  // OGP情報を一括取得
  const ogPreviews = programs.reduce((acc, p) => {
    if (p.og_image_url && !acc[p.id]) {
      acc[p.id] = <OGPreviewServer imageUrl={p.og_image_url} className="rounded-lg border" />;
    }
    return acc;
  }, {} as Record<string, React.ReactNode>);

  return (
    <TimeTable
      programs={programs}
      mode={layoutMode}
      ogPreviews={ogPreviews}
    />
  );
}

function LoaderScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}