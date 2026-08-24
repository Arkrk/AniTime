import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Globe, History } from "lucide-react";
import { FaXTwitter, FaWikipediaW } from "react-icons/fa6";
import { getWorkById } from "@/lib/get-work";
import { formatRelativeTime } from "@/lib/date-utils";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkProgramManager } from "@/components/works/WorkProgramManager";
import { defaultOpenGraph } from "@/lib/metadata";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";
import { WorkActionsMenu } from "@/components/works/WorkActionsMenu";
import { cn } from "@/lib/utils";
import { getSeasonBadgeClass } from "@/lib/colors";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const workId = Number(id);

  if (isNaN(workId)) return {};

  const work = await getWorkById(workId);
  return {
    title: work?.name,
    openGraph: { ...defaultOpenGraph, title: work?.name, url: `/works/${id}` },
    twitter: { title: work?.name },
  };
}

export default async function WorkPage({ params }: PageProps) {
  const { id } = await params;
  const workId = Number(id);

  if (isNaN(workId)) {
    notFound();
  }

  const work = await getWorkById(workId);

  if (!work) {
    notFound();
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <BackButton />
      <WorkActionsMenu work={work} floating />
      {work.og_image_url && (
        <div className="relative w-full shrink-0 border-b overflow-hidden flex items-center justify-center bg-black/5">
          <div
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
            style={{ backgroundImage: `url(${work.og_image_url})` }}
          />
          <div className="relative w-full max-w-4xl mx-auto">
            <OGPreviewServer imageUrl={work.og_image_url} />
          </div>
        </div>
      )}

      <div className={cn("flex-1 px-4 pb-16 md:px-8 max-w-4xl mx-auto w-full", work.og_image_url ? "pt-4" : "pt-16")}>
        {/* 作品情報 */}
        <div className="mb-8">
          {work.seasons && (
            <Link href={`/works?season=${work.seasons.year}-${work.seasons.month}`}>
              <Badge className={cn("px-2 py-2.5 md:px-2.5 md:py-3 text-[11px] md:text-xs hover:opacity-80 transition-opacity", getSeasonBadgeClass(work.seasons.month))}>
                {work.seasons.year}年{work.seasons.month}月
              </Badge>
            </Link>
          )}
          <h1 className="text-2xl md:text-3xl font-bold mt-1.5 mb-4">{work.name}</h1>

          <div className="flex flex-wrap gap-1">
            {work.website_url && (
              <Button size="sm" asChild>
                <a href={work.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />公式サイト
                </a>
              </Button>
            )}
            {work.x_username && (
              <Button variant="secondary" size="sm" asChild>
                <a href={`https://x.com/${work.x_username}`} target="_blank" rel="noopener noreferrer">
                  <FaXTwitter className="h-4 w-4" />@{work.x_username}
                </a>
              </Button>
            )}
            {work.wikipedia_url && (
              <Button variant="secondary" size="sm" asChild>
                <a href={work.wikipedia_url} target="_blank" rel="noopener noreferrer">
                  <FaWikipediaW className="h-4 w-4" />Wikipedia
                </a>
              </Button>
            )}
            {work.annict_url && (
              <Button variant="secondary" size="sm" asChild>
                <a href={work.annict_url} target="_blank" rel="noopener noreferrer">
                  Annict
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* 番組一覧 */}
        <WorkProgramManager workId={workId} />

        {(work.updated_at || work.created_at) && (
          <div className="mt-8 text-right text-sm text-muted-foreground flex items-center justify-end gap-1">
            <History className="h-4 w-4" />
            {work.updated_at
              ? `${formatRelativeTime(work.updated_at)}に更新`
              : work.created_at && `${formatRelativeTime(work.created_at)}に追加`}
          </div>
        )}
      </div>
    </div>
  );
}
