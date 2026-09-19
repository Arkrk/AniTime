import { useState } from "react";
import { createClient } from "@/utils/client";
import { useRouter } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getYoutubeVideoPublishedAt } from "@/lib/youtube";
import { toast } from "sonner";

export function useVideos(workId: number) {
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  /**
   * Supabase操作時の共通エラーハンドリング
   * @param actionName 操作名
   * @param fn 実行する関数
   * @returns true: 成功, false: 失敗
   */
  const withErrorHandling = async (actionName: "追加" | "更新" | "削除", fn: () => Promise<void>) => {
    setIsSaving(true);
    try {
      await fn();
      router.refresh();
      return true;
    } catch (error: any) {
      if (error.message === "VIDEO_NOT_FOUND") {
        toast.error(`動画の${actionName}に失敗しました`, {
          description: "このURLの動画は存在しません",
        });
      } else {
        console.error(`Failed to execute ${actionName}:`, error);
        toast.error(`動画の${actionName}に失敗しました`);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * YouTube Data API から動画の公開日時を取得
   * @param vid YouTubeの動画ID
   * @returns 動画の公開日時
   */
  const fetchYoutubeData = async (vid: string) => {
    const res = await getYoutubeVideoPublishedAt(vid);
    if (res && res.error === "VIDEO_NOT_FOUND") {
      throw new Error("VIDEO_NOT_FOUND");
    }
    return res ? res.uploadedAt : null;
  };

  /**
   * 動画を追加
   * @param title タイトル
   * @param vid YouTubeの動画ID
   */
  const addVideo = (title: string, vid: string) =>
    withErrorHandling("追加", async () => {
      const uploadedAt = await fetchYoutubeData(vid);
      const { error } = await supabase
        .from("videos")
        .insert({ work_id: workId, title, vid, uploaded_at: uploadedAt });
      if (error) throw error;
    });

  /**
   * 動画を更新
   * @param id ID
   * @param title タイトル
   * @param newVid 新しいYouTubeの動画ID
   * @param currentVid 現在のYouTubeの動画ID
   */
  const updateVideo = (id: number, title: string, newVid: string, currentVid: string) =>
    withErrorHandling("更新", async () => {
      let uploadedAt = undefined;
      if (newVid !== currentVid) {
        uploadedAt = await fetchYoutubeData(newVid);
      } else {
        await requireAuth();
      }

      const updateData: any = { title, vid: newVid };
      if (uploadedAt !== undefined) {
        updateData.uploaded_at = uploadedAt;
      }

      const { error } = await supabase
        .from("videos")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    });

  /**
   * 動画を削除
   * @param id ID
   */
  const deleteVideo = (id: number) =>
    withErrorHandling("削除", async () => {
      await requireAuth();
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    });

  return {
    addVideo,
    updateVideo,
    deleteVideo,
    isSaving,
  };
}
