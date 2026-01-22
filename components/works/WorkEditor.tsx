"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Loader2, Plus, AtSign } from "lucide-react";
import { updateWork, deleteWork, createWork } from "@/lib/actions";

interface Work {
  id: number;
  name: string;
  website_url: string | null;
  x_username: string | null;
  wikipedia_url: string | null;
  annict_url: string | null;
}

interface WorkEditorProps {
  work?: Work;
}

export function WorkEditor({ work }: WorkEditorProps) {
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: work?.name || "",
    website_url: work?.website_url || "",
    x_username: work?.x_username || "",
    wikipedia_url: work?.wikipedia_url || "",
    annict_url: work?.annict_url || "",
  });

  useEffect(() => {
    if (work) {
      setFormData({
        name: work.name,
        website_url: work.website_url || "",
        x_username: work.x_username || "",
        wikipedia_url: work.wikipedia_url || "",
        annict_url: work.annict_url || "",
      });
    } else {
      setFormData({
        name: "",
        website_url: "",
        x_username: "",
        wikipedia_url: "",
        annict_url: "",
      });
    }
  }, [work, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name) return;
    setIsSaving(true);
    try {
      if (work) {
        await updateWork(work.id, {
          name: formData.name,
          website_url: formData.website_url || null,
          x_username: formData.x_username || null,
          wikipedia_url: formData.wikipedia_url || null,
          annict_url: formData.annict_url || null,
        });
      } else {
        await createWork({
          name: formData.name,
          website_url: formData.website_url || null,
          x_username: formData.x_username || null,
          wikipedia_url: formData.wikipedia_url || null,
          annict_url: formData.annict_url || null,
        });
      }
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert(work ? "更新に失敗しました" : "作成に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!work) return;
    if (!confirm("本当に削除しますか？ この操作は取り消せません。")) return;
    setIsDeleting(true);
    try {
      await deleteWork(work.id);
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
      setIsDeleting(false);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {work ? (
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
            編集
          </Button>
        ) : (
          <Button variant="default" size="sm">
            <Plus className="h-4 w-4" />
            新規
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="flex flex-col w-screen sm:w-150">
        <SheetHeader>
          <SheetTitle>{work ? "作品を編集" : "作品を追加"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">タイトル</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website_url">公式サイトのURL</Label>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="x_username">Xのユーザー名</Label>
              <div className="relative">
                <AtSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="x_username"
                  name="x_username"
                  value={formData.x_username}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="wikipedia_url">WikipediaのURL</Label>
              <Input
                id="wikipedia_url"
                name="wikipedia_url"
                value={formData.wikipedia_url}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="annict_url">AnnictのURL</Label>
              <Input
                id="annict_url"
                name="annict_url"
                value={formData.annict_url}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
        <SheetFooter className={`flex flex-row items-center ${work ? "justify-between w-full" : "justify-end"}`}>
          {work && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              削除
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isDeleting || isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {work ? "保存" : "追加"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
