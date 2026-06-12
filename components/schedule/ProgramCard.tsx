"use client";

import React from "react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Clock, Calendar, Bookmark, Globe } from "lucide-react";
import { FaXTwitter, FaWikipediaW } from "react-icons/fa6";
import { LayoutProgram, LayoutMode } from "@/types/schedule";
import { formatTime30, getProgramColorClass } from "@/lib/schedule-utils";
import { DAYS } from "@/lib/get-schedule";
import { cn } from "@/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useSavedPrograms } from "@/hooks/use-saved-programs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProgramCardSettings } from "@/hooks/use-program-card-settings";

type ProgramCardProps = {
  program: LayoutProgram;
  mode: LayoutMode;
  className?: string;
  style?: React.CSSProperties;
  ogPreview?: React.ReactNode;
  colWidth?: number;
  forceDesktopSize?: boolean;
};

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, mode, className, style, ogPreview, colWidth = 160, forceDesktopSize = false }) => {
  const { isSaved, toggleSaved } = useSavedPrograms();
  const isHoverable = useMediaQuery("(hover: hover)");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { hoverDetails, showOgPreview } = useProgramCardSettings();
  const saved = isSaved(String(program.id));
  const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";

  const popupSide = isDesktop ? "right" : "bottom";
  const popupAlign = isDesktop ? "start" : "center";

  const triggerElement = (
    <div
      className={cn(
        "absolute p-1 rounded cursor-pointer group flex flex-col transition-all duration-200",
        "overflow-hidden",
        // ホバー時の拡張設定
        "hover:h-auto! hover:z-1 hover:shadow-2xl hover:scale-[1.02]",
        getProgramColorClass(program.color),
        saved ? "border-red-500 dark:border-white border-2" : "border",
        className
      )}
      style={{
        top: program.top,
        height: program.height - 2,
        minHeight: program.height - 2,
        left: program.laneIndex * colWidth + 2,
        width: colWidth - 4,
        ...style,
      }}
    >
      <div className="flex flex-col h-full">
        {/* チャンネル名（エリア別表示時のみ） */}
        {mode === "area" && (
          <span className={cn(forceDesktopSize ? "text-xs" : "text-[10px] md:text-xs", "font-semibold truncate leading-none shrink-0")}>
            {program.channel_name}
          </span>
        )}
        {/* 放送開始日 */}
        {program.start_date && (
          <span className={cn(forceDesktopSize ? "text-xs" : "text-[10px] md:text-xs", "w-fit rounded shrink-0")}>
            {format(parseISO(program.start_date), "y年M月d日～", { locale: ja })}
          </span>
        )}
        {/* 放送時間 */}
        <span className={cn(forceDesktopSize ? "text-xs opacity-70" : "text-[10px] md:text-xs opacity-75 md:opacity-70", "leading-none my-0.5 tracking-tight shrink-0")}>
          {formatTime30(program.start_time)}～{formatTime30(program.end_time)}
        </span>
        {/* 番組名 */}
        <span className={cn(forceDesktopSize ? "text-[13px] leading-tight" : "text-[11px] md:text-[13px] leading-[1.15] md:leading-tight", "font-bold group-hover:line-clamp-none")}>
          {program.name}
        </span>
      </div>
    </div>
  );

  const programDetails = (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
        {/* 放送開始日 */}
        {program.start_date ? (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>
              {format(parseISO(program.start_date), "y年M月d日～", { locale: ja })}
            </span>
          </div>
        ) : (
          <div />
        )}
        {/* 放送時間 */}
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>
            <span>{dayLabel}曜</span>
            <span className="ml-1">{formatTime30(program.start_time)}～{formatTime30(program.end_time)}</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        {/* チャンネル名 */}
        <span className="text-xs text-muted-foreground mb-0.5">{program.channel_name}</span>

        {/* 作品タイトル */}
        <h2 className="text-base font-bold leading-snug flex-1">
          {program.work_id ? (
            <Link href={`/works/${program.work_id}`} className="hover:underline">
              {program.name}
            </Link>
          ) : (
            program.name
          )}
        </h2>
      </div>

      {/* バージョン・メモ */}
      {(program.version || program.note) && (
        <div className="flex flex-col gap-1">

          {program.version && (
            <span className="text-sm text-blue-600 dark:text-blue-300 font-medium w-fit">
              {program.version}
            </span>
          )}

          {program.note && (
            <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed mt-0.5">
              {program.note}
            </p>
          )}
        </div>
      )}

      {/* タグ */}
      {program.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {program.tags.map((tag) => (
            <span
              key={tag}
              className="px-1.5 py-0.5 bg-secondary text-secondary-foreground text-[10px] rounded-sm border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* OGプレビュー */}
      {program.website_url && showOgPreview && ogPreview}

      {/* 各種リンク・保存ボタン */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex gap-1">
          {program.website_url && (
            <Button asChild variant="outline">
              <a
                href={program.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe />
                公式サイト
              </a>
            </Button>
          )}
          {program.x_username && (
            <Button asChild variant="outline" size="icon" title="X">
              <a
                href={`https://x.com/${program.x_username}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter />
              </a>
            </Button>
          )}
          {program.wikipedia_url && (
            <Button asChild variant="outline" size="icon" title="Wikipedia">
              <a
                href={program.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaWikipediaW />
              </a>
            </Button>
          )}
        </div>
        <Toggle
          pressed={saved}
          onPressedChange={() => toggleSaved(String(program.id))}
          variant="outline"
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          {saved ? "削除" : "保存"}
        </Toggle>
      </div>
    </div>
  );

  if (isHoverable && hoverDetails) {
    return (
      <HoverCard openDelay={300} closeDelay={50}>
        <HoverCardTrigger asChild>
          {triggerElement}
        </HoverCardTrigger>
        <HoverCardContent className="w-80 p-4 shadow-xl z-50" side={popupSide} align={popupAlign}>
          {programDetails}
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {triggerElement}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 shadow-xl z-50" side={popupSide} align={popupAlign}>
        {programDetails}
      </PopoverContent>
    </Popover>
  );
};