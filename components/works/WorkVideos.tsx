"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Database } from "@/types/supabase";
import { Play, ChevronLeft, ChevronRight, Plus, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/hooks/login";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VideoEditor } from "./VideoEditor";
import { useVideos } from "@/hooks/use-videos";

type Video = Database["public"]["Tables"]["videos"]["Row"];

export function WorkVideos({ workId, videos }: { workId: number; videos: Video[] }) {
  const { user } = useLogin();
  const { deleteVideo } = useVideos(workId);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | undefined>(undefined);
  const [videoToDelete, setVideoToDelete] = useState<number | null>(null);

  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  const handleVideoClick = (e: React.MouseEvent, video: Video) => {
    e.preventDefault();
    if (activeVideo?.id === video.id && isPlayerOpen) {
      setIsPlayerOpen(false);
    } else {
      setActiveVideo(video);
      setIsPlayerOpen(true);
    }
  };

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

  const handleAddClick = () => {
    setEditingVideo(undefined);
    setIsEditorOpen(true);
  };

  const handleEditClick = (video: Video) => {
    setEditingVideo(video);
    setIsEditorOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (videoToDelete !== null) {
      await deleteVideo(videoToDelete);
      setVideoToDelete(null);
    }
  };

  if ((!videos || videos.length === 0) && !user) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Play className="text-muted-foreground" />
          <h2 className="text-lg font-bold">動画</h2>
        </div>
        {user && (
          <button className="p-1 hover:bg-foreground/10 rounded-xl outline-none" onClick={handleAddClick} aria-label="動画を追加">
            <Plus className="size-5" />
          </button>
        )}
      </div>

      {videos && videos.length > 0 && (
        <div>
          <div className="relative group/carousel -mx-4 md:mx-0">
            {/* 左スクロールボタン */}
            {canScrollLeft && (
              <div className="absolute left-0 top-25.5 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-10 rounded-full shadow-md"
                  onClick={scrollLeft}
                  aria-label="前へスクロール"
                >
                  <ChevronLeft className="size-5" />
                </Button>
              </div>
            )}

            {/* 動画一覧カルーセル */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScrollability}
              className="flex overflow-x-auto gap-4 pb-4 pt-3 -mt-3 pl-4 md:px-3 md:-mx-3 snap-x snap-mandatory scroll-pl-4 md:scroll-pl-3 md:scroll-fade-x scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] after:content-[''] after:w-px after:shrink-0 md:after:hidden"
            >
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="group flex-none w-70 md:w-80 snap-start rounded-2xl outline-none transition-all ring-12 ring-transparent hover:bg-accent hover:ring-accent relative cursor-pointer"
                  onClick={(e) => handleVideoClick(e, video)}
                >
                  <div className="block">
                    <div
                      className={`relative overflow-hidden aspect-video rounded-2xl border bg-background transition-all duration-300 ${activeVideo?.id === video.id && isPlayerOpen
                        ? "border-transparent ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : "border-border"
                        }`}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${video.vid}/maxresdefault.jpg`}
                        alt={video.title}
                        className="object-cover object-center w-full h-full"
                        loading="lazy"
                        onLoad={(e) => {
                          if (e.currentTarget.naturalWidth <= 120) {
                            e.currentTarget.src = `https://img.youtube.com/vi/${video.vid}/sddefault.jpg`;
                          }
                        }}
                      />
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center text-white transition-all duration-300 pointer-events-none ${activeVideo?.id === video.id && isPlayerOpen ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"
                          }`}
                      >
                        <Play className="size-10 md:size-12" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium truncate" title={video.title}>
                        {video.title}
                      </h3>
                      {video.uploaded_at && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {format(new Date(video.uploaded_at), "yyyy年M月d日")}
                        </p>
                      )}
                    </div>

                    {user && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1 hover:bg-foreground/10 rounded-xl outline-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="size-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(video)}>
                            <Pencil />
                            動画を編集
                          </DropdownMenuItem>
                          <DropdownMenuItem variant="destructive" onClick={() => setVideoToDelete(video.id)}>
                            <Trash2 />
                            動画を削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 右スクロールボタン */}
            {canScrollRight && (
              <div className="absolute right-0 top-25.5 translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                <Button
                  variant="secondary"
                  size="icon"
                  className="size-10 rounded-full shadow-md"
                  onClick={scrollRight}
                  aria-label="次へスクロール"
                >
                  <ChevronRight className="size-5" />
                </Button>
              </div>
            )}
          </div>

          {/* 埋め込み動画表示エリア */}
          <div
            className={`grid transition-all duration-500 ease-in-out rounded-2xl overflow-hidden ${isPlayerOpen ? "grid-rows-[1fr] opacity-100 mt-4 border" : "grid-rows-[0fr] opacity-0 mt-0 border-0"
              }`}
          >
            <div className="overflow-hidden">
              {activeVideo && (
                <div className="relative w-full aspect-video overflow-hidden bg-black shadow-lg">
                  {isPlayerOpen && (
                    <iframe
                      key={activeVideo.vid}
                      src={`https://www.youtube.com/embed/${activeVideo.vid}?autoplay=1`}
                      title={activeVideo.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {user && (
        <VideoEditor
          workId={workId}
          video={editingVideo}
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
        />
      )}

      <AlertDialog open={videoToDelete !== null} onOpenChange={(open) => !open && setVideoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>動画を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={async (e) => {
                e.preventDefault();
                await handleDeleteConfirm();
              }}
            >
              <Trash2 />
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
