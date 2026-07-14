import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProgramItem } from "./ProgramItem";

export interface SortableItemProps {
  program: any;
  onEdit: (program: any) => void;
  onDuplicate: (program: any) => void;
  onDelete: (id: number) => void;
  isSaved?: boolean;
  onToggleSaved?: (id: string) => void;
  isReordering?: boolean;
}

export function SortableItem({ program, onEdit, onDuplicate, onDelete, isSaved, onToggleSaved, isReordering }: SortableItemProps) {
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
      isReordering={isReordering}
      dragRef={setNodeRef}
      style={style}
      dragHandleProps={{ ...attributes, ...listeners }}
      onEdit={onEdit}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      isSaved={isSaved}
      onToggleSaved={onToggleSaved}
    />
  );
}
