"use client";

import { useState, useEffect } from "react";
import { useWorkPrograms } from "@/hooks/use-work-programs";
import { WorkProgramForm } from "./WorkProgramForm";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Loader2, Plus, Pencil, Trash2, GripVertical, Calendar, Clock, Copy } from "lucide-react";
import { formatTime30, getProgramColorClass } from "@/lib/schedule-utils";
import { DAYS } from "@/lib/get-schedule";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  program: any;
  onEdit: (program: any) => void;
  onDuplicate: (program: any) => void;
  onDelete: (id: number) => void;
}

function SortableItem({ program, onEdit, onDuplicate, onDelete }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: program.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";
  const colorClass = getProgramColorClass(program.color);

  return (
    <div ref={setNodeRef} style={style} className={`p-4 flex flex-col gap-3 ${colorClass} border-b relative group`}>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-neutral-900/80 rounded p-1">
        <button {...attributes} {...listeners} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
        </button>
        <button onClick={() => onDuplicate(program)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
          <Copy className="h-4 w-4 text-green-500" />
        </button>
        <button onClick={() => onEdit(program)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
          <Pencil className="h-4 w-4 text-blue-500" />
        </button>
        <button onClick={() => onDelete(program.id)} className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded">
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">
            {program.channels?.name || "未定"}
          </span>
          {program.programs_seasons?.map((ps: any) => (
             ps.seasons && <Badge key={ps.seasons.id} variant="secondary" className="bg-white/50 dark:bg-white/30 text-xs font-normal">{ps.seasons.year}年{ps.seasons.month}月</Badge>
          ))}
        </div>
        
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-mono shrink-0">
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
        </div>
      </div>

      {program.version && (
        <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
          {program.version}
        </div>
      )}

      {program.programs_tags && program.programs_tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {program.programs_tags?.map((pt: any) => (
            pt.tags && (
              <span
                key={pt.tags.id}
                className="px-1.5 py-0.5 bg-white/50 dark:bg-white/30 text-primary text-xs rounded-sm border border-black/5"
              >
                {pt.tags.name}
              </span>
            )
          ))}
        </div>
      )}

      {program.note && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-black/5 pt-2 mt-1">
          {program.note}
        </p>
      )}
    </div>
  );
}

export function WorkProgramManager({ workId, initialPrograms }: { workId: number, initialPrograms: any[] }) {
  const {
    user,
    programs,
    channels,
    tags,
    seasons,
    loading,
    addProgram,
    updateProgram,
    deleteProgram,
    reorderPrograms
  } = useWorkPrograms(workId);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderPrograms(Number(active.id), Number(over.id));
    }
  };

  const handleAdd = () => {
    setEditingProgram(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setIsDialogOpen(true);
  };

  const handleDuplicate = (program: any) => {
    const { id, created_at, updated_at, ...rest } = program;
    setEditingProgram(rest);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("本当に削除しますか？")) {
      await deleteProgram(id);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProgram?.id) {
        await updateProgram(editingProgram.id, data);
      } else {
        await addProgram(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // サーバーサイドレンダリング時または非ログイン時は初期データを表示
  // ただし、ログインしてロード完了したら編集可能なリストを表示
  const displayPrograms = (mounted && user && !loading) ? programs : initialPrograms;
  const isEditable = mounted && !!user;

  if (!isEditable) {
    // 閲覧モード
    return (
      <div className="space-y-4">
        <div className="rounded-md border overflow-hidden">
          {displayPrograms.length > 0 ? (
            displayPrograms.map((program, index) => {
              const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";
              const colorClass = getProgramColorClass(program.color);
              const isLast = index === displayPrograms.length - 1;
              
              return (
                <div 
                  key={program.id} 
                  className={`p-4 flex flex-col gap-3 ${colorClass} ${!isLast ? "border-b" : ""}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base">
                        {program.channels?.name || "未定"}
                      </span>
                      {program.programs_seasons?.map((ps: any) => (
                         ps.seasons && <Badge key={ps.seasons.id} variant="secondary" className="bg-white/50 dark:bg-white/30 text-xs font-normal">{ps.seasons.name}</Badge>
                      ))}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-mono shrink-0">
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
                    </div>
                  </div>

                  {program.version && (
                    <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">
                      {program.version}
                    </div>
                  )}

                  {program.programs_tags && program.programs_tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      {program.programs_tags?.map((pt: any) => (
                        pt.tags && (
                          <span
                            key={pt.tags.id}
                            className="px-1.5 py-0.5 bg-white/50 dark:bg-white/30 text-primary text-xs rounded-sm border border-black/5"
                          >
                            {pt.tags.name}
                          </span>
                        )
                      ))}
                    </div>
                  )}

                  {program.note && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t border-black/5 pt-2 mt-1">
                      {program.note}
                    </p>
                  )}
                </div>
              );
            })
          ) : (
            <Empty className="border-0">
              <EmptyMedia variant="icon">
                <Calendar className="h-5 w-5" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>放送スケジュールがありません</EmptyTitle>
                <EmptyDescription>
                  登録されている放送スケジュールはありません。
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    );
  }

  // 編集モード
  return (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-neutral-500" />
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={programs.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="rounded-md border overflow-hidden">
              {programs.length > 0 ? (
                programs.map((program) => (
                  <SortableItem
                    key={program.id}
                    program={program}
                    onEdit={handleEdit}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <Empty className="border-0">
                  <EmptyMedia variant="icon">
                    <Calendar className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle>放送スケジュールがありません</EmptyTitle>
                    <EmptyDescription>
                      登録されている放送スケジュールはありません。
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
              <button
                onClick={handleAdd}
                className="w-full p-4 flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-t font-medium text-sm"
              >
                <Plus className="h-4 w-4" />
                番組を追加
              </button>
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="flex flex-col w-screen sm:w-150">
          <SheetHeader>
            <SheetTitle>{editingProgram?.id ? "番組を編集" : "番組を追加"}</SheetTitle>
          </SheetHeader>
          <WorkProgramForm
            initialData={editingProgram || {}}
            channels={channels}
            tags={tags}
            seasons={seasons}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
