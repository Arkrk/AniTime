"use client";

import { useEffect, useState } from "react";
import { Ellipsis, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogin } from "@/hooks/login";
import { WorkEditor } from "@/components/works/WorkEditor";
import { deleteWork } from "@/lib/actions";
import { toast } from "sonner";

interface Work {
  id: number;
  name: string;
  name_yomi: string | null;
  website_url: string | null;
  x_username: string | null;
  wikipedia_url: string | null;
  annict_url: string | null;
  season_id: number | null;
}

interface WorkActionsMenuProps {
  work: Work;
  deleteRedirectTo?: string;
  floating?: boolean;
  className?: string;
}

export function WorkActionsMenu({
  work,
  deleteRedirectTo = "/",
  floating = false,
  className,
}: WorkActionsMenuProps) {
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const buttonVariant = floating ? "outline" : "ghost";

  useEffect(() => {
    setMounted(true);
  }, []);

  // ログインしていない場合は何も表示しない
  if (!mounted || !user) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteWork(work.id, deleteRedirectTo);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "削除に失敗しました");
    }
  };

  const menu = (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={buttonVariant}
            size="icon"
            className={className}
            aria-label="作品の操作メニュー"
          >
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              setEditorOpen(true);
            }}
          >
            <Pencil />
            作品を編集
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => {
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 />
            作品を削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>作品を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              番組データを含む、この作品に関連するデータがすべて削除されます。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                setDeleteConfirmOpen(false);
                void handleDelete();
              }}
            >
              <Trash2 />
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <WorkEditor
        work={work}
        open={editorOpen}
        onOpenChange={setEditorOpen}
      />
    </>
  );

  if (floating) {
    return (
      <div className="absolute top-4 right-4 z-50 bg-background/80 rounded-4xl backdrop-blur-md">
        {menu}
      </div>
    );
  }

  return menu;
}