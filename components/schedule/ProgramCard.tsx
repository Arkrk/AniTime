"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { Clock, Calendar, Bookmark, Globe, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { FaXTwitter, FaWikipediaW } from "react-icons/fa6";
import { LayoutProgram, LayoutMode } from "@/types/schedule";
import { formatTime30 } from "@/lib/format-time";
import { getProgramColorClass } from "@/lib/colors";
import { DAYS } from "@/lib/format-days";
import { cn } from "cn";
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
  // 番組IDをキーとしたOGプレビュー（指定時は ogPreview より優先。スタック切替時に使用）
  ogPreviews?: Record<string, React.ReactNode>;
  colWidth?: number;
  forceDesktopSize?: boolean;
};

export const ProgramCard: React.FC<ProgramCardProps> = ({ program: baseProgram, mode, className, style, ogPreview: baseOgPreview, ogPreviews, colWidth = 160, forceDesktopSize = false }) => {
  const { isSaved, toggleSaved } = useSavedPrograms();
  const searchParams = useSearchParams();
  const isHoverable = useMediaQuery("(hover: hover)");
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { hoverDetails, showOgPreview } = useProgramCardSettings();

  // チャンネル・曜日・放送時間が同じ番組スタック
  const stack = baseProgram.stackedPrograms && baseProgram.stackedPrograms.length > 1 ? baseProgram.stackedPrograms : null;
  const stackCount = stack?.length ?? 1;
  const [stackIndex, setStackIndex] = useState(0);
  const currentIndex = Math.min(stackIndex, stackCount - 1);
  // 配置情報は維持しつつ、番組情報を選択中のものに差し替える
  const program: LayoutProgram = stack ? { ...baseProgram, ...stack[currentIndex] } : baseProgram;
  const ogPreview = ogPreviews ? ogPreviews[program.id] : baseOgPreview;

  const saved = isSaved(String(program.id));
  const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";

  const hideChannelName = mode === "channel" || mode === "season" || (mode === "week" && searchParams?.get("grouping") === "channel");

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
      {/* スタック件数バッジ */}
      {stack && (
        <span className="absolute top-0.5 right-0.5 flex items-center gap-0.5 rounded-full bg-background/80 px-1 py-0.5 text-[10px] font-bold leading-none text-foreground shadow-sm tabular-nums">
          <Layers className="size-2.5" />
          {currentIndex + 1}/{stackCount}
        </span>
      )}
      <div className="flex flex-col h-full">
        {/* チャンネル名（列がチャンネルではない場合は非表示） */}
        {!hideChannelName && (
          <span className={cn(forceDesktopSize ? "text-xs" : "text-[10px] md:text-xs", "font-semibold truncate leading-[1.15] shrink-0")}>
            {program.channel_name}
          </span>
        )}
        {/* 放送開始日 */}
        {program.start_date && (
          <span className={cn(forceDesktopSize ? "text-xs" : "text-[10px] md:text-xs", "leading-[1.15] w-fit rounded shrink-0")}>
            {format(parseISO(program.start_date), "y年M月d日～", { locale: ja })}
          </span>
        )}
        {/* 放送時間 */}
        <span className={cn(forceDesktopSize ? "text-xs" : "text-[10px] md:text-xs", "tracking-tight shrink-0 opacity-70")}>
          {formatTime30(program.start_time)}～{formatTime30(program.end_time, program.start_time)}
        </span>
        {/* 番組名 */}
        <span className={cn(forceDesktopSize ? "text-[13px]" : "text-[11px] md:text-[13px]", "font-bold leading-tight group-hover:line-clamp-none")}>
          {program.name}
        </span>
      </div>
    </div>
  );

  const programDetails = (
    <div className="flex flex-col gap-3">
      {/* スタック切替 */}
      {stack && (
        <div className="flex items-center justify-between -mt-2.5 -mx-2.5 bg-accent rounded-full">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStackIndex(Math.max(currentIndex - 1, 0))}
            disabled={currentIndex === 0}
            aria-label="前の番組"
          >
            <ChevronLeft />
          </Button>
          <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
            <Layers className="size-3" />
            {currentIndex + 1} / {stackCount}
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setStackIndex(Math.min(currentIndex + 1, stackCount - 1))}
            disabled={currentIndex === stackCount - 1}
            aria-label="次の番組"
          >
            <ChevronRight />
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
        {/* 放送開始日 */}
        {program.start_date ? (
          <div className="flex items-center gap-1">
            <Calendar className="size-3" />
            <span>
              {format(parseISO(program.start_date), "y年M月d日～", { locale: ja })}
            </span>
          </div>
        ) : (
          <div />
        )}
        {/* 放送時間 */}
        <div className="flex items-center gap-1">
          <Clock className="size-3" />
          <span>
            <span>{dayLabel}曜</span>
            <span className="ml-1">{formatTime30(program.start_time)}～{formatTime30(program.end_time, program.start_time)}</span>
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
              className="px-1.5 py-0.5 bg-secondary text-[10px] rounded-sm border"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* OGプレビュー */}
      {program.og_image_url && showOgPreview && ogPreview}

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
          <Bookmark className={cn("size-4", saved && "fill-current")} />
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