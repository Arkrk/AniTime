"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Globe, Clapperboard, ImageOff } from "lucide-react";
import { FaXTwitter, FaWikipediaW } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/layout/Pagination";
import { Empty, EmptyMedia, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { WorkActionsMenu } from "@/components/works/WorkActionsMenu";
import { useLogin } from "@/hooks/login";

interface WorkWithSeason {
  id: number;
  name: string;
  name_yomi: string | null;
  website_url: string | null;
  x_username: string | null;
  wikipedia_url: string | null;
  annict_url: string | null;
  season_id: number | null;
  og_image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  seasons?: {
    id: number;
    year: number;
    month: number;
  } | null;
}

export const WorksList = ({
  works,
  currentPage,
  pageCount,
  totalCount,
  ogPreviews
}: {
  works: any[];
  currentPage: number;
  pageCount: number;
  totalCount: number;
  ogPreviews: Record<number, React.ReactNode>;
}) => {

  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && listRef.current) {
      const scrollContainer = listRef.current.closest(".overflow-auto");
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }, [currentPage, mounted]);

  if (works.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <Empty>
          <EmptyMedia variant="icon">
            <Clapperboard className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>表示する作品がありません</EmptyTitle>
            <EmptyDescription>
              選択された放送開始クールに<br />一致する作品がありません。
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div ref={listRef} className="p-4 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {works.map((work: WorkWithSeason) => {
          const hasLinks = work.website_url || work.x_username || work.wikipedia_url;

          return (
            <div
              key={work.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border bg-primary-foreground hover:bg-accent transition-colors"
            >
              {/* 作品詳細へのリンク（カード全体を覆う） */}
              <Link
                href={`/works/${work.id}`}
                className="absolute inset-0 z-0"
                aria-label={`${work.name}の詳細`}
              />
              {/* プレビュー画像のコンテナ */}
              <div className="aspect-[1.91/1] w-full relative overflow-hidden bg-muted border-b pointer-events-none">
                {work.website_url ? (
                  <div className="w-full h-full">
                    {ogPreviews[work.id]}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                    <ImageOff className="w-6 h-6" />
                  </div>
                )}
              </div>

              {/* 作品情報エリア */}
              <div className="p-3 flex flex-col flex-1 justify-between gap-3 pointer-events-none">
                <div className="space-y-2">
                  {/* 作品名 */}
                  <h3 className="font-medium text-base line-clamp-3 sm:h-[4.5em] leading-normal">
                    {work.name}
                  </h3>
                </div>

                {/* リンクボタン・管理者操作メニュー */}
                {(hasLinks || (mounted && user)) && (
                  <div className="flex items-center justify-between pt-2 border-t mt-auto gap-1.5 relative z-10 pointer-events-auto">
                    <div className="flex flex-wrap gap-1">
                      {work.website_url && (
                        <Button size="icon-sm" variant="outline" asChild>
                          <a
                            href={work.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="公式サイト"
                          >
                            <Globe />
                          </a>
                        </Button>
                      )}
                      {work.x_username && (
                        <Button size="icon-sm" variant="outline" asChild>
                          <a
                            href={`https://x.com/${work.x_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`X (@${work.x_username})`}
                          >
                            <FaXTwitter />
                          </a>
                        </Button>
                      )}
                      {work.wikipedia_url && (
                        <Button size="icon-sm" variant="outline" asChild>
                          <a
                            href={work.wikipedia_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Wikipedia"
                          >
                            <FaWikipediaW />
                          </a>
                        </Button>
                      )}
                    </div>
                    {mounted && user && (
                      <div onClick={(e) => e.stopPropagation()} className="ml-auto shrink-0">
                        <WorkActionsMenu work={work as any} deleteRedirectTo="/works" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ページネーション */}
      <Pagination
        currentPage={currentPage}
        pageCount={pageCount}
        totalCount={totalCount}
        createPageUrl={createPageUrl}
      />
    </div>
  );
};
