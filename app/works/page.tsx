import type { Metadata } from "next";
import { Suspense } from "react";
import { getWorks } from "@/lib/get-work";
import { getSeasons, resolveSeasonId } from "@/lib/get-seasons";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";
import { WorksList } from "@/components/works/WorksList";
import { defaultOpenGraph } from "@/lib/metadata";
import { Spinner } from "@/components/ui/spinner";
import { LoadingOverlay } from "@/components/layout/LoadingOverlay";
import { AddWorkButton } from "@/components/works/AddWorkButton";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";
import { SortSelector } from "@/components/works/SortSelector";

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata: Metadata = {
  title: "作品",
  openGraph: { ...defaultOpenGraph, title: "作品", url: "/works" },
  twitter: { title: "作品" },
};

export default async function WorksPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // シーズン一覧を取得
  const seasons = await getSeasons();

  // シーズンIDの決定
  const latestSeasonId = seasons.length > 0 ? seasons[0].id : "all";
  const currentSeasonId = resolveSeasonId(params.season, seasons, latestSeasonId);

  // ページ番号の決定
  const currentPage = Number(params.page) || 1;

  // ソートキーとソート順序の決定
  const currentSort = typeof params.sort === "string" ? params.sort : "name_yomi";
  const currentOrder = params.order === "desc" ? "desc" : "asc";

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
      <div className="shrink-0 p-4 border-b z-10 sticky top-0 bg-background/85 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <span>作品</span>
              <Suspense fallback={<span className="text-base font-normal text-muted-foreground"></span>}>
                <WorksCountWrapper currentSeasonId={currentSeasonId} currentPage={currentPage} currentSort={currentSort} currentOrder={currentOrder} />
              </Suspense>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <SeasonSelector seasons={seasons} currentSeasonId={currentSeasonId} showAll={true} />
            <SortSelector currentSort={currentSort} currentOrder={currentOrder} />
            <AddWorkButton />
          </div>
        </div>
      </div>

      {/* 作品リストエリア */}
      <div className="flex-1 min-h-0 relative">
        <LoadingOverlay currentParamsKey={currentParamsKey} eventName="loading-start">
          <div className="h-full w-full overflow-auto">
            <Suspense fallback={<LoaderScreen />}>
              <WorksListWrapper currentSeasonId={currentSeasonId} currentPage={currentPage} currentSort={currentSort} currentOrder={currentOrder} />
            </Suspense>
          </div>
        </LoadingOverlay>
      </div>

    </div>
  );
}

async function WorksListWrapper({
  currentSeasonId,
  currentPage,
  currentSort,
  currentOrder,
}: {
  currentSeasonId: number | "all";
  currentPage: number;
  currentSort: string;
  currentOrder: "asc" | "desc";
}) {
  const limit = 50;
  // 作品データを取得
  const { data: works, count } = await getWorks(currentPage, limit, currentSort, currentOrder, currentSeasonId);
  const pageCount = count ? Math.ceil(count / limit) : 0;

  // OGPプレビューをサーバー側で生成
  const ogPreviews = works.reduce((acc, w) => {
    if (w.og_image_url && !acc[w.id]) {
      acc[w.id] = <OGPreviewServer imageUrl={w.og_image_url} className="w-full h-full" />;
    }
    return acc;
  }, {} as Record<number, React.ReactNode>);

  return (
    <WorksList
      works={works}
      currentPage={currentPage}
      pageCount={pageCount}
      totalCount={count || 0}
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

async function WorksCountWrapper({
  currentSeasonId,
  currentPage,
  currentSort,
  currentOrder,
}: {
  currentSeasonId: number | "all";
  currentPage: number;
  currentSort: string;
  currentOrder: "asc" | "desc";
}) {
  const limit = 50;
  const { count } = await getWorks(currentPage, limit, currentSort, currentOrder, currentSeasonId);

  if (count === null || count === undefined || count === 0) return null;

  return (
    <span className="text-base font-normal text-muted-foreground">
      {count}
    </span>
  );
}
