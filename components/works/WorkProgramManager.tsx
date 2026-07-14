"use client";

import { useState, useEffect } from "react";
import { useWorkPrograms } from "@/hooks/use-work-programs";
import { WorkProgramForm } from "./WorkProgramForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { Spinner } from "../ui/spinner";
import { ArrowUpDown, Check, Plus, TvMinimal } from "lucide-react";
import { useSavedPrograms } from "@/hooks/use-saved-programs";
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
  arrayMove,
} from "@dnd-kit/sortable";
import { ProgramItem } from "./ProgramItem";
import { SortableItem } from "./SortableItem";

export function WorkProgramManager({ workId }: { workId: number }) {
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
    saveProgramsOrder
  } = useWorkPrograms(workId);
  const { isSaved, toggleSaved } = useSavedPrograms();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [localPrograms, setLocalPrograms] = useState<any[]>([]);

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
      const oldIndex = localPrograms.findIndex((p) => p.id === active.id);
      const newIndex = localPrograms.findIndex((p) => p.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setLocalPrograms(arrayMove(localPrograms, oldIndex, newIndex));
      }
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

  const displayPrograms = isReordering ? localPrograms : programs;
  const isEditable = mounted && !!user;

  if (!mounted || loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="size-8 text-muted-foreground" />
      </div>
    );
  }

  const renderContent = () => {
    if (displayPrograms.length === 0) {
      return (
        <Empty>
          <EmptyMedia variant="icon">
            <TvMinimal className="h-5 w-5" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle>放送情報がありません</EmptyTitle>
            <EmptyDescription>公式からの発表をお待ちください</EmptyDescription>
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
                isSaved={isSaved(program.id.toString())}
                onToggleSaved={toggleSaved}
                isReordering={isReordering}
              />
            ))}
          </SortableContext>
        </DndContext>
      );
    }

    return (
      <>
        {displayPrograms.map((program, index) => (
          <ProgramItem
            key={program.id}
            program={program}
            isEditable={false}
            isLast={index === displayPrograms.length - 1}
            isSaved={isSaved(program.id.toString())}
            onToggleSaved={toggleSaved}
            isReordering={false}
          />
        ))}
      </>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">放送情報</h2>
      </div>

      <div className="rounded-2xl border overflow-hidden">
        {renderContent()}
        {isEditable && (
          <div className="flex items-stretch">
            {!isReordering && (
              <button
                onClick={handleAdd}
                className={`flex-1 p-4 flex items-center justify-center gap-2 text-muted-foreground bg-primary-foreground hover:bg-accent hover:text-foreground cursor-pointer transition-colors font-medium text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                  ${displayPrograms.length > 1 ? "rounded-bl-2xl" : "rounded-b-2xl"}`}
              >
                <Plus className="h-4 w-4" />
                番組を追加
              </button>
            )}
            {displayPrograms.length > 1 && (
              <button
                onClick={() => {
                  if (isReordering) {
                    const isChanged = localPrograms.length === programs.length && localPrograms.some((p, i) => p.id !== programs[i].id);
                    if (isChanged) {
                      saveProgramsOrder(localPrograms);
                    }
                    setIsReordering(false);
                  } else {
                    setLocalPrograms(programs);
                    setIsReordering(true);
                  }
                }}
                className={`flex items-center justify-center gap-2 cursor-pointer transition-colors font-medium text-sm bg-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset
                  ${isReordering
                    ? "flex-1 p-4 text-foreground hover:bg-accent rounded-b-2xl"
                    : "px-6 border-l text-muted-foreground hover:bg-accent hover:text-foreground rounded-br-2xl"
                  }`}
              >
                {isReordering ? <Check className="h-4 w-4" /> : <ArrowUpDown className="h-4 w-4" />}
                {isReordering ? "並べ替えを完了" : "並べ替え"}
              </button>
            )}
          </div>
        )}
      </div>

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="flex flex-col w-screen sm:w-150" aria-describedby={undefined}>
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
