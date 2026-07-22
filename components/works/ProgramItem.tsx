import { Badge } from "@/components/ui/badge";
import { GripVertical, Calendar, Clock, Copy, Pencil, Trash2, Bookmark, BookmarkOff, ExternalLink, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatTime30, getProgramColorClass } from "@/lib/schedule-utils";
import { DAYS } from "@/lib/get-schedule";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

export interface ProgramItemProps {
  program: any;
  isEditable?: boolean;
  isLast?: boolean;
  dragHandleProps?: any;
  dragRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  onEdit?: (program: any) => void;
  onDuplicate?: (program: any) => void;
  onDelete?: (id: number) => void;
  isSaved?: boolean;
  onToggleSaved?: (id: string) => void;
  isReordering?: boolean;
}

export function ProgramItem({
  program,
  isEditable = false,
  isLast = false,
  dragHandleProps,
  dragRef,
  style,
  onEdit,
  onDuplicate,
  onDelete,
  isSaved,
  onToggleSaved,
  isReordering = false,
}: ProgramItemProps) {
  const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";
  const colorClass = getProgramColorClass(program.color);
  const hasDetails = Boolean(
    program.version ||
    program.note ||
    (program.programs_tags && program.programs_tags.some((pt: any) => pt.tags))
  );

  const renderActionMenu = () => {
    if (isReordering) {
      return (
        <div className="flex items-center">
          <button
            {...dragHandleProps}
            className="p-1 hover:bg-foreground/15 rounded-xl cursor-grab active:cursor-grabbing touch-none outline-none"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 hover:bg-foreground/15 rounded-xl outline-none">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onToggleSaved && onToggleSaved(program.id.toString())}>
              {isSaved ? (
                <>
                  <BookmarkOff />
                  保存済みから削除
                </>
              ) : (
                <>
                  <Bookmark />
                  保存
                </>
              )}
            </DropdownMenuItem>

            {(() => {
              const validSeasons = program.programs_seasons?.filter((ps: any) => ps.seasons) || [];
              if (validSeasons.length === 0) return null;

              if (validSeasons.length === 1) {
                const season = validSeasons[0].seasons;
                return (
                  <DropdownMenuItem asChild>
                    <Link href={`/?season=${season.id}&day=${program.day_of_the_week}`}>
                      <ExternalLink />
                      番組表に移動
                    </Link>
                  </DropdownMenuItem>
                );
              }

              return (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <ExternalLink />
                    番組表に移動
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {validSeasons.map((ps: any) => (
                      <DropdownMenuItem key={ps.seasons.id} asChild>
                        <Link href={`/?season=${ps.seasons.id}&day=${program.day_of_the_week}`}>
                          {ps.seasons.year}年{ps.seasons.month}月
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              );
            })()}

            {isEditable && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(program)}>
                  <Copy />
                  番組を複製
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit && onEdit(program)}>
                  <Pencil />
                  番組を編集
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onClick={() => onDelete && onDelete(program.id)}>
                  <Trash2 />
                  番組を削除
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div
      ref={dragRef}
      style={style}
      className={`px-4 py-3.5 flex items-center ${colorClass} ${(!isEditable && isLast) ? "" : "border-b"} group`}
    >
      <div className={`flex-1 min-w-0 flex flex-col transition-all duration-300 ease-in-out ${isReordering || !hasDetails ? 'gap-0' : 'gap-2'}`}>
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex flex-col md8:flex-row md8:items-center justify-between gap-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between md8:justify-start gap-2 w-full md8:w-auto min-h-7">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-bold text-base">
                  {program.channels?.name || "*"}
                </span>
                {(() => {
                  const validSeasons = program.programs_seasons?.filter((ps: any) => ps.seasons) || [];
                  if (validSeasons.length === 0) return null;

                  const firstSeason = validSeasons[0];
                  const remainingCount = validSeasons.length - 1;

                  return (
                    <>
                      <Badge variant="outline" className="px-1.75 py-2.5 border-black/20 dark:border-white/50 text-xs font-normal">
                        {firstSeason.seasons.year}年{firstSeason.seasons.month}月
                      </Badge>
                      {remainingCount > 0 && (
                        <span className="text-xs">+{remainingCount}</span>
                      )}
                    </>
                  );
                })()}
                {isSaved && (
                  <Bookmark className="h-4 w-4 shrink-0" fill="currentColor" />
                )}
              </div>

              {/* モバイルサイズ用 */}
              {!isReordering && (
                <div className="md8:hidden shrink-0 -mr-1.5">
                  {renderActionMenu()}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 text-sm shrink-0">
              {program.start_date && (
                <>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span>{format(parseISO(program.start_date), "y年M月d日～", { locale: ja })}</span>
                  </div>
                  <div className="h-3 w-px bg-black/20 dark:bg-white/20" />
                </>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 shrink-0" />
                <span>
                  <span>{dayLabel}曜</span>
                  <span className="ml-1">{formatTime30(program.start_time)}～{formatTime30(program.end_time)}</span>
                </span>
              </div>

              {/* デスクトップサイズ用 */}
              <div className="hidden md8:block shrink-0 -mr-1.5">
                {renderActionMenu()}
              </div>
            </div>
          </div>

          {/* モバイルサイズ用 */}
          {isReordering && (
            <div className="md8:hidden shrink-0 -mr-1.5">
              {renderActionMenu()}
            </div>
          )}
        </div>

        <div className={`grid min-w-0 transition-all duration-300 ease-in-out ${isReordering ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
          <div className="overflow-hidden flex flex-col gap-2">
            {program.version && (
              <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                {program.version}
              </div>
            )}

            {program.note && (
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {program.note}
              </p>
            )}

            {program.programs_tags && program.programs_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 py-0.5">
                {program.programs_tags?.map((pt: any) => (
                  pt.tags && (
                    <span
                      key={pt.tags.id}
                      className="px-1.5 py-0.5 bg-white/60 dark:bg-white/30 text-foreground text-xs rounded-sm border"
                    >
                      {pt.tags.name}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
