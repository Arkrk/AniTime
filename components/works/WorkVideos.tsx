"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Database } from "@/types/supabase";
import { Video, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

type Video = Database["public"]["Tables"]["videos"]["Row"];

export function WorkVideos({ videos }: { videos: Video[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
    }
  }, []);

  useEffect(() => {
    checkScrollability();
    window.addEventListener("resize", checkScrollability);
    return () => {
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability, videos]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Video className="text-muted-foreground" />
        <h2 className="text-lg font-bold">動画</h2>
      </div>
      <div className="relative group/carousel -mr-4 md:mr-0">
        {/* 左スクロールボタン */}
        {canScrollLeft && (
          <div className="absolute left-0 top-[calc(50%-8px)] -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md"
              onClick={scrollLeft}
              aria-label="前へスクロール"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        )}

        {/* 動画一覧カルーセル */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollability}
          className="flex overflow-x-auto gap-4 pb-4 pr-4 md:pr-0 snap-x snap-mandatory md:scroll-fade-x scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
        >
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.vid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex-none w-70 md:w-80 snap-start rounded-2xl overflow-hidden border bg-primary-foreground hover:bg-accent transition-colors"
            >
              <div className="aspect-video relative overflow-hidden">
                <img
                  src={`https://img.youtube.com/vi/${video.vid}/maxresdefault.jpg`}
                  alt={video.title}
                  className="object-cover w-full h-full"
                  loading="lazy"
                />
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-medium truncate">
                  {video.title}
                </h3>
                {video.uploaded_at && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {format(new Date(video.uploaded_at), "yyyy年M月d日")}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* 右スクロールボタン */}
        {canScrollRight && (
          <div className="absolute right-0 top-[calc(50%-8px)] translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-full shadow-md"
              onClick={scrollRight}
              aria-label="次へスクロール"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
