import type { Metadata } from "next";
import { Suspense } from "react";
import { getScheduleByDay } from "@/lib/get-schedule";
import { getSeasons } from "@/lib/get-seasons";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { SavedProgramList } from "@/components/saved/SavedProgramList";
import { defaultOpenGraph } from "@/lib/metadata";
import { Spinner } from "@/components/ui/spinner";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "保存済み",
  openGraph: { ...defaultOpenGraph, title: "保存済み", url: "/saved" },
  twitter: { title: "保存済み" },
};

export default async function SavedPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // シーズン一覧を取得
  const seasons = await getSeasons();
  
  // シーズンIDの決定
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : 0;
  const seasonParam = params.season;
  const currentSeasonId = seasonParam ? Number(seasonParam) : latestSeasonId;

  // renderKeyを生成
  const sp = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach((v) => sp.append(key, v));
    } else if (val !== undefined) {
      sp.append(key, val);
    }
  }
  const currentParamsKey = sp.toString();

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
      <div className="flex-1 overflow-auto relative">
        <LoadingOverlay currentParamsKey={currentParamsKey} eventName="season-change-start">
          <Suspense fallback={<LoaderScreen />}>
            <SavedProgramListWrapper currentSeasonId={currentSeasonId} />
          </Suspense>
        </LoadingOverlay>
      </div>
      
    </div>
  );
}

async function SavedProgramListWrapper({ currentSeasonId }: { currentSeasonId: number }) {
  // 全番組データ取得 (day=0 で全曜日取得)
  const programs = await getScheduleByDay(0, currentSeasonId);

  // OGP情報を一括取得
  const ogPreviews = programs.reduce((acc, p) => {
    if (p.website_url && !acc[p.website_url]) {
      acc[p.website_url] = <OGPreviewServer url={p.website_url} />;
    }
    return acc;
  }, {} as Record<string, React.ReactNode>);

  return <SavedProgramList programs={programs} ogPreviews={ogPreviews} />;
}

function LoaderScreen() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spinner className="size-8 text-muted-foreground" />
    </div>
  );
}
