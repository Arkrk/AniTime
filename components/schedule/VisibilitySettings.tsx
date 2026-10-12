"use client";

import { useEffect, useMemo, useState } from "react";
import { getAreas, getChannels } from "@/lib/get-channels";
import { useVisibilitySettings } from "@/hooks/use-visibility-settings";
import { useAreaOrder, sortAreasByOrder } from "@/hooks/use-area-order";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpDown, ChevronDown, GripVertical, ListChecks } from "lucide-react";
import { cn } from "cn";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  Modifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Area = { id: number; name: string; order: number };
type Channel = { id: number; name: string; order: number; area_id: number };

// ドラッグを縦方向のみに制限する
const restrictToVerticalAxis: Modifier = ({ transform }) => ({ ...transform, x: 0 });

type SortableAreaItemProps = {
  area: Area;
  areaChannels: Channel[];
  hiddenChannelIds: number[];
  toggleChannel: (id: number) => void;
  setChannelVisibility: (ids: number[], visible: boolean) => void;
  isReordering: boolean;
};

function SortableAreaItem({
  area,
  areaChannels,
  hiddenChannelIds,
  toggleChannel,
  setChannelVisibility,
  isReordering,
}: SortableAreaItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: area.id, disabled: !isReordering });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 20 : undefined,
  };

  // そのエリアのすべてのチャンネルが表示されているかどうかを確認
  const allVisible = areaChannels.every(c => !hiddenChannelIds.includes(c.id));
  const someVisible = areaChannels.some(c => !hiddenChannelIds.includes(c.id));
  const isIndeterminate = someVisible && !allVisible;

  const handleAreaToggle = () => {
    const ids = areaChannels.map(c => c.id);
    if (allVisible) {
      // すべて非表示
      setChannelVisibility(ids, false);
    } else {
      // すべて表示
      setChannelVisibility(ids, true);
    }
  };

  return (
    <AccordionItem
      ref={setNodeRef}
      style={style}
      value={`area-${area.id}`}
      className={cn("border-b last:border-b-0 group overflow-hidden", isDragging && "shadow-lg")}
    >
      <div className="flex h-11 items-center bg-primary-foreground hover:bg-accent relative z-10">
        <div className="flex items-center pl-4 py-3 pr-3">
          <Checkbox
            id={`area-group-${area.id}`}
            checked={isIndeterminate ? "indeterminate" : allVisible}
            onCheckedChange={handleAreaToggle}
          />
        </div>
        {isReordering ? (
          <div className="flex flex-1 items-center justify-between py-3 pr-4 font-bold text-left text-sm">
            {area.name}
            <button
              type="button"
              ref={setActivatorNodeRef}
              {...attributes}
              {...listeners}
              aria-label={`${area.name}を並べ替え`}
              className="ml-1 -my-1 -mr-1 p-1 rounded-full text-muted-foreground hover:bg-foreground/10 hover:text-foreground cursor-grab active:cursor-grabbing touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <GripVertical className="size-4 shrink-0" />
            </button>
          </div>
        ) : (
          <AccordionPrimitive.Header className="flex flex-1">
            <AccordionPrimitive.Trigger
              className={cn(
                "flex flex-1 items-center justify-between py-3 pr-4 font-bold transition-all [&[data-state=open]>svg]:rotate-180",
                "text-left text-sm"
              )}
            >
              {area.name}
              <ChevronDown className="text-muted-foreground size-4 shrink-0 transition-transform duration-200 ml-2" />
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>
        )}
      </div>
      <AccordionContent className="p-0">
        <div className="flex flex-col border-t">
          {areaChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent transition-colors cursor-pointer pl-8"
              onClick={() => toggleChannel(channel.id)}
            >
              <Checkbox
                id={`channel-${channel.id}`}
                checked={!hiddenChannelIds.includes(channel.id)}
                className="pointer-events-none"
              />
              <Label
                htmlFor={`channel-${channel.id}`}
                className="text-sm font-medium flex-1 pointer-events-none cursor-pointer"
              >
                {channel.name}
              </Label>
            </div>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

export function VisibilitySettings() {
  const { hiddenChannelIds, toggleChannel, setChannelVisibility, loaded } = useVisibilitySettings();
  const { areaOrder, updateAreaOrder, loaded: areaOrderLoaded } = useAreaOrder();
  const [areas, setAreas] = useState<Area[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [areasData, channelsData] = await Promise.all([getAreas(), getChannels()]);
      setAreas(areasData || []);
      setChannels(channelsData || []);
      setLoadingData(false);
    };
    fetchData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 保存された並び順でエリアを並べ替え
  const orderedAreas = useMemo(() => sortAreasByOrder(areas, areaOrder), [areas, areaOrder]);

  // チャンネルを持つエリアのみ表示
  const visibleAreas = useMemo(
    () => orderedAreas
      .map((area) => ({ area, areaChannels: channels.filter((c) => c.area_id === area.id) }))
      .filter(({ areaChannels }) => areaChannels.length > 0),
    [orderedAreas, channels]
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const ids = orderedAreas.map((a) => a.id);
    const oldIndex = ids.indexOf(Number(active.id));
    const newIndex = ids.indexOf(Number(over.id));
    if (oldIndex !== -1 && newIndex !== -1) {
      updateAreaOrder(arrayMove(ids, oldIndex, newIndex));
    }
  };

  const handleModeChange = (mode: string) => {
    const nextIsReordering = mode === "reorder";
    if (nextIsReordering) {
      // 並べ替えモード開始時はアコーディオンをすべて閉じる
      setOpenItems([]);
    }
    setIsReordering(nextIsReordering);
  };

  const isLoading = !loaded || !areaOrderLoaded || loadingData;

  return (
    <ScrollArea className="flex-1 min-h-0">
      <div className="flex flex-col gap-6 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-3">
          <Tabs value={isReordering ? "reorder" : "select"} onValueChange={handleModeChange}>
            <TabsList className="w-full">
              <TabsTrigger id="area-mode-select" value="select">
                <ListChecks />
                選択
              </TabsTrigger>
              <TabsTrigger id="area-mode-reorder" value="reorder">
                <ArrowUpDown />
                並べ替え
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {isLoading ? (
            <div className="flex w-full flex-col overflow-hidden rounded-2xl border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="border-b last:border-b-0 bg-primary-foreground">
                  <div className="flex h-11 items-center">
                    <div className="flex items-center pl-4 py-3 pr-3">
                      <Skeleton className="size-4 rounded-sm" />
                    </div>
                    <div className="flex flex-1 items-center justify-between py-3 pr-4">
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                modifiers={[restrictToVerticalAxis]}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={visibleAreas.map(({ area }) => area.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Accordion
                    type="multiple"
                    value={openItems}
                    onValueChange={(value) => {
                      // 並べ替えモード中は開閉しない
                      if (!isReordering) setOpenItems(value);
                    }}
                  >
                    {visibleAreas.map(({ area, areaChannels }) => (
                      <SortableAreaItem
                        key={area.id}
                        area={area}
                        areaChannels={areaChannels}
                        hiddenChannelIds={hiddenChannelIds}
                        toggleChannel={toggleChannel}
                        setChannelVisibility={setChannelVisibility}
                        isReordering={isReordering}
                      />
                    ))}
                  </Accordion>
                </SortableContext>
              </DndContext>
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
