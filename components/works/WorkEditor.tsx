"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "../ui/spinner";
import { Switch } from "@/components/ui/switch";
import { AtSign, Globe, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateWork, createWork } from "@/lib/actions";
import { getSeasons, Season } from "@/lib/get-seasons";
import { SeasonSelector } from "@/components/schedule/SeasonSelector";

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

interface WorkEditorProps {
  work?: Work;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function WorkEditor({
  work,
  open,
  onOpenChange,
}: WorkEditorProps) {
  const { user } = useLogin();
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sheetOpen = open ?? internalOpen;
  const setSheetOpen = onOpenChange ?? setInternalOpen;
  const [isSaving, setIsSaving] = useState(false);
  const [skipInsertTimestamp, setSkipInsertTimestamp] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [formData, setFormData] = useState({
    name: work?.name || "",
    name_yomi: work?.name_yomi || "",
    website_url: work?.website_url || "",
    x_username: work?.x_username || "",
    wikipedia_url: work?.wikipedia_url || "",
    annict_url: work?.annict_url || "",
    season_id: work?.season_id ?? null as number | null,
  });

  useEffect(() => {
    async function loadSeasons() {
      const data = await getSeasons();
      setSeasons(data);
    }
    loadSeasons();
  }, []);

  useEffect(() => {
    if (work) {
      setFormData({
        name: work.name,
        name_yomi: work.name_yomi || "",
        website_url: work.website_url || "",
        x_username: work.x_username || "",
        wikipedia_url: work.wikipedia_url || "",
        annict_url: work.annict_url || "",
        season_id: work.season_id ?? null,
      });
    } else {
      setFormData({
        name: "",
        name_yomi: "",
        website_url: "",
        x_username: "",
        wikipedia_url: "",
        annict_url: "",
        season_id: null,
      });
    }
  }, [work, sheetOpen]);

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
          name_yomi: formData.name_yomi || null,
          website_url: formData.website_url || null,
          x_username: formData.x_username || null,
          wikipedia_url: formData.wikipedia_url || null,
          annict_url: formData.annict_url || null,
          season_id: formData.season_id,
        });
      } else {
        await createWork({
          name: formData.name,
          name_yomi: formData.name_yomi || null,
          website_url: formData.website_url || null,
          x_username: formData.x_username || null,
          wikipedia_url: formData.wikipedia_url || null,
          annict_url: formData.annict_url || null,
          season_id: formData.season_id,
        }, skipInsertTimestamp);
      }
      setSheetOpen(false);
    } catch (error) {
      console.error(error);
      alert(work ? "更新に失敗しました" : "作成に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="flex flex-col w-screen sm:w-150" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{work ? "作品を編集" : "作品を追加"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="name">タイトル</FieldLabel>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="name_yomi">タイトルの読み</FieldLabel>
              <Input
                id="name_yomi"
                name="name_yomi"
                value={formData.name_yomi}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="season_id">放送開始クール</FieldLabel>
              <SeasonSelector
                seasons={seasons}
                currentSeasonId={formData.season_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, season_id: value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="website_url">公式サイトのURL</FieldLabel>
              <Input
                id="website_url"
                name="website_url"
                value={formData.website_url}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="x_username">Xのユーザー名</FieldLabel>
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
            </Field>
            <Field>
              <FieldLabel htmlFor="wikipedia_url">WikipediaのURL</FieldLabel>
              <Input
                id="wikipedia_url"
                name="wikipedia_url"
                value={formData.wikipedia_url}
                onChange={handleChange}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="annict_url">AnnictのURL</FieldLabel>
              <Input
                id="annict_url"
                name="annict_url"
                value={formData.annict_url}
                onChange={handleChange}
              />
            </Field>
          </div>
        </div>
        <SheetFooter className={`flex flex-row items-center justify-between w-full`}>
          {!work ? (
            <div className="flex items-center space-x-2">
              <Globe className={cn("h-4 w-4 transition-colors", !skipInsertTimestamp ? "text-foreground" : "text-muted-foreground")} />
              <Switch
                id="skip-insert-timestamp"
                checked={skipInsertTimestamp}
                onCheckedChange={setSkipInsertTimestamp}
              />
              <Lock className={cn("h-4 w-4 transition-colors", skipInsertTimestamp ? "text-foreground" : "text-muted-foreground")} />
            </div>
          ) : null}
          <div className="ml-auto flex gap-2">
            <Button variant="outline" onClick={() => setSheetOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Spinner />}
              {work ? "保存" : "追加"}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
