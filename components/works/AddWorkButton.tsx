"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { Button } from "@/components/ui/button";
import { Plus, CloudDownload } from "lucide-react";
import { WorkEditor } from "@/components/works/WorkEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AnnictSearchDialog } from "./AnnictSearchDialog";

export function AddWorkButton() {
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [annictSearchOpen, setAnnictSearchOpen] = useState(false);
  const [prefilledData, setPrefilledData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) {
    return null;
  }

  const handleAnnictSelect = (workData: any) => {
    setPrefilledData(workData);
    setAnnictSearchOpen(false);
    setCreateOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="icon">
            <Plus />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => {
            setPrefilledData(null);
            setCreateOpen(true);
          }}>
            <Plus />
            作品を追加
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAnnictSearchOpen(true)}>
            <CloudDownload />
            Annict から取得
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WorkEditor
        open={createOpen}
        onOpenChange={setCreateOpen}
        initialData={prefilledData}
      />

      <AnnictSearchDialog
        open={annictSearchOpen}
        onOpenChange={setAnnictSearchOpen}
        onSelect={handleAnnictSelect}
      />
    </>
  );
}
