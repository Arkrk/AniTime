"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { getChannels } from "@/lib/get-channels";
import { getSeasons } from "@/lib/get-seasons";
import { getTags } from "@/lib/get-tags";
import {
  getWorkPrograms,
  addProgramAction,
  updateProgramAction,
  deleteProgramAction,
  saveProgramsOrderAction
} from "@/lib/action-programs";
import { WorkProgramForm } from "./WorkProgramForm";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";
import { ProgramItemSkeleton } from "./ProgramItemSkeleton";
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
  const { user } = useLogin();

  const [programs, setPrograms] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isSaved, toggleSaved } = useSavedPrograms();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [localPrograms, setLocalPrograms] = useState<any[]>([]);

  const fetchProgramsData = async () => {
    const data = await getWorkPrograms(workId);
    setPrograms(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [channelsData, tagsData, seasonsData] = await Promise.all([
          getChannels(),
          getTags(),
          getSeasons(),
        ]);
        setChannels(channelsData);
        setTags(tagsData);
        setSeasons(seasonsData);
        await fetchProgramsData();
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    setMounted(true);
  }, [workId]);

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
      try {
        await deleteProgramAction(id);
        setPrograms(programs.filter((p) => p.id !== id));
      } catch (e) {
        console.error(e);
        alert("削除に失敗しました");
      }
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingProgram?.id) {
        await updateProgramAction(workId, editingProgram.id, data);
      } else {
        await addProgramAction(workId, data);
      }
      await fetchProgramsData();
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  const displayPrograms = isReordering ? localPrograms : programs;
  const isEditable = mounted && !!user && !loading;

  const renderContent = () => {
    if (!mounted || loading) {
      return (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProgramItemSkeleton key={i} isLast={i === 2} />
          ))}
        </>
      );
    }

    if (displayPrograms.length === 0) {
      return (
        <Empty>
          <EmptyMedia variant="icon">
            <TvMinimal />
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
      <div className="flex items-center gap-2">
        <TvMinimal className="text-muted-foreground" />
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
                <Plus className="size-4" />
                番組を追加
              </button>
            )}
            {displayPrograms.length > 1 && (
              <button
                onClick={() => {
                  if (isReordering) {
                    const isChanged = localPrograms.length === programs.length && localPrograms.some((p, i) => p.id !== programs[i].id);
                    if (isChanged) {
                      const updates = localPrograms.map((p, index) => ({
                        id: p.id,
                        order: index + 1,
                      }));
                      // 保存完了を待たずにUIに反映
                      setPrograms(localPrograms);
                      saveProgramsOrderAction(updates).catch((e) => {
                        console.error(e);
                        alert("並び順の保存に失敗しました");
                        fetchProgramsData(); // 保存失敗の場合は元に戻す
                      });
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
                {isReordering ? <Check className="size-4" /> : <ArrowUpDown className="size-4" />}
                {isReordering ? "並べ替えを完了" : "並べ替え"}
              </button>
            )}
          </div>
        )}
      </div>

      <Sheet open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <SheetContent className="flex flex-col w-screen sm:w-150 max-sm:border-none" aria-describedby={undefined}>
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
