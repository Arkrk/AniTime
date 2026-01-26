import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { FaXTwitter, FaWikipediaW } from "react-icons/fa6";

import { getWorkById } from "@/lib/get-work";
import { BackButton } from "@/components/layout/BackButton";
import { Button } from "@/components/ui/button";
import { WorkProgramManager } from "@/components/works/WorkProgramManager";
import { WorkEditor } from "@/components/works/WorkEditor";

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

      <div className="flex-1 p-4 md:px-8 pt-16 max-w-4xl mx-auto w-full">
        {/* 作品情報 */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold my-4">{work.name}</h1>
          
          <div className="flex flex-wrap gap-2">
            {work.website_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={work.website_url} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4" />公式サイト
                </a>
              </Button>
            )}
            {work.x_username && (
              <Button variant="outline" size="sm" asChild>
                <a href={`https://x.com/${work.x_username}`} target="_blank" rel="noopener noreferrer">
                  <FaXTwitter className="h-4 w-4" />@{work.x_username}
                </a>
              </Button>
            )}
            {work.wikipedia_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={work.wikipedia_url} target="_blank" rel="noopener noreferrer">
                  <FaWikipediaW className="h-4 w-4" />Wikipedia
                </a>
              </Button>
            )}
            {work.annict_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={work.annict_url} target="_blank" rel="noopener noreferrer">
                  Annict
                </a>
              </Button>
            )}
            <WorkEditor work={work} />
          </div>
        </div>

        {/* 番組一覧 */}
        <div>
          <h2 className="text-xl font-bold mb-4">放送スケジュール</h2>
          <WorkProgramManager workId={workId} initialPrograms={work.programs} />
        </div>
      </div>
    </div>
  );
}
