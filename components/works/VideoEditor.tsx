"use client";

import { useState, useEffect } from "react";
import { useLogin } from "@/hooks/login";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "../ui/spinner";
import { Database } from "@/types/supabase";
import { useVideos } from "@/hooks/use-videos";

type Video = Database["public"]["Tables"]["videos"]["Row"];

const PRESET_TITLES = [
  "PV",
  "ティザーPV",
  "メインPV",
  "本PV",
  "キャラクターPV",
  "解禁PV",
  "番宣CM",
  "映像",
  "予告",
  "特報",
  "制作決定",
  "放送直前",
  "第2クール",
  "トレーラー",
  "パイロットフィルム",
  "第1弾",
  "第2弾",
  "第3弾",
  "第4弾",
  "第5弾",
];

interface VideoEditorProps {
  workId: number;
  video?: Video;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function VideoEditor({
  workId,
  video,
  open,
  onOpenChange,
}: VideoEditorProps) {
  const { user } = useLogin();
  const { addVideo, updateVideo, isSaving } = useVideos(workId);
  const [mounted, setMounted] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sheetOpen = open ?? internalOpen;
  const setSheetOpen = onOpenChange ?? setInternalOpen;

  const [formData, setFormData] = useState({
    title: "",
    vidOrUrl: "",
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        vidOrUrl: video.vid,
      });
    } else {
      setFormData({
        title: "",
        vidOrUrl: "",
      });
    }
  }, [video, sheetOpen]);

  const extractVid = (input: string) => {
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
    if (input.length === 11) {
      return input;
    }
    return input;
  };
  const handlePresetClick = (preset: string) => {
    setFormData((prev) => ({
      ...prev,
      title: prev.title ? `${prev.title}${preset}` : preset,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.vidOrUrl) return;

    const vid = extractVid(formData.vidOrUrl);

    if (video) {
      const success = await updateVideo(video.id, formData.title, vid, video.vid);
      if (success) {
        setSheetOpen(false);
      }
    } else {
      const success = await addVideo(formData.title, vid);
      if (success) {
        setSheetOpen(false);
      }
    }
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="flex flex-col w-screen sm:w-150" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>{video ? "動画を編集" : "動画を追加"}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-4">
            <Field>
              <FieldLabel htmlFor="title">タイトル</FieldLabel>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="動画のタイトル"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {PRESET_TITLES.map((preset) => (
                  <Badge
                    key={preset}
                    variant="secondary"
                    className="cursor-pointer hover:bg-secondary/80 font-normal transition-colors"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset}
                  </Badge>
                ))}
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="vidOrUrl">YouTube URL または Video ID</FieldLabel>
              <Input
                id="vidOrUrl"
                name="vidOrUrl"
                value={formData.vidOrUrl}
                onChange={handleChange}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </Field>
          </div>
        </div>
        <SheetFooter className="flex flex-row items-center justify-end w-full gap-2">
          <Button variant="outline" onClick={() => setSheetOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Spinner />}
            {video ? "保存" : "追加"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
