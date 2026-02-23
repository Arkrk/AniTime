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

interface ProgramItemProps {
  program: any;
  isEditable?: boolean;
  dragHandleProps?: any;
  dragRef?: (node: HTMLElement | null) => void;
  style?: React.CSSProperties;
  onEdit?: (program: any) => void;
  onDuplicate?: (program: any) => void;
  onDelete?: (id: number) => void;
}

function ProgramItem({
  program,
  isEditable = false,
  dragHandleProps,
  dragRef,
  style,
  onEdit,
  onDuplicate,
  onDelete,
}: ProgramItemProps) {
  const dayLabel = DAYS.find(d => d.id === program.day_of_the_week)?.label || "?";
  const colorClass = getProgramColorClass(program.color);

  return (
    <div
      ref={dragRef}
      style={style}
      className={`p-4 flex flex-col gap-3 ${colorClass} border-b relative group`}
    >
      {isEditable && (
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 dark:bg-neutral-900/80 rounded p-1 z-10">
          <button
            {...dragHandleProps}
            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4 text-gray-500 dark:text-neutral-400" />
          </button>
          <button
            onClick={() => onDuplicate && onDuplicate(program)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          >
            <Copy className="h-4 w-4 text-green-500" />
          </button>
          <button
            onClick={() => onEdit && onEdit(program)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          >
            <Pencil className="h-4 w-4 text-blue-500" />
          </button>
          <button
            onClick={() => onDelete && onDelete(program.id)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base">
            {program.channels?.name || "未定"}
          </span>
          {(() => {
            const validSeasons = program.programs_seasons?.filter((ps: any) => ps.seasons) || [];
            if (validSeasons.length === 0) return null;

            const lastSeason = validSeasons[validSeasons.length - 1];
            const remainingCount = validSeasons.length - 1;

            return (
              <>
                <Badge variant="outline" className="border-black/20 dark:border-white/50 text-xs font-normal">
                  {lastSeason.seasons.year}年{lastSeason.seasons.month}月
                </Badge>
                {remainingCount > 0 && (
                  <span className="text-xs text-muted-foreground">+{remainingCount}</span>
                )}
              </>
            );
          })()}
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

      {program.note && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {program.note}
        </p>
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
    </div>
  );
}

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

  return (
    <ProgramItem
      program={program}
      isEditable={true}
      dragRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
    />
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

  const displayPrograms = (mounted && user && !loading) ? programs : initialPrograms;
  const isEditable = mounted && !!user;

  if (loading && isEditable) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400 dark:text-neutral-500" />
      </div>
    );
  }

  const renderContent = () => {
    if (displayPrograms.length === 0) {
      return (
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
      );
    }

    if (isEditable) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayPrograms.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            {displayPrograms.map((program) => (
              <SortableItem
                key={program.id}
                program={program}
                onEdit={handleEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <>
        {displayPrograms.map((program) => (
          <ProgramItem
            key={program.id}
            program={program}
            isEditable={false}
          />
        ))}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        {renderContent()}
        {isEditable && (
          <button
            onClick={handleAdd}
            className="w-full p-4 flex items-center justify-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors border-t font-medium text-sm"
          >
            <Plus className="h-4 w-4" />
            番組を追加
          </button>
        )}
      </div>

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
