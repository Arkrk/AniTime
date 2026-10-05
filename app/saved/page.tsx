import type { Metadata } from "next";
import { defaultOpenGraph } from "@/lib/metadata";
import { getSeasons, resolveSeasonId } from "@/lib/get-seasons";
import { SavedContent } from "@/components/saved/SavedContent";

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
  const currentSeasonId = resolveSeasonId(params.season, seasons, latestSeasonId);
  const currentSeason = seasons.find((s) => s.id === currentSeasonId) || null;

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
      <SavedContent 
        seasons={seasons} 
        currentSeasonId={currentSeasonId} 
        currentSeason={currentSeason} 
        currentParamsKey={currentParamsKey} 
      />
    </div>
  );
}
