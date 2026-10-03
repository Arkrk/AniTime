"use server";

import { createClient } from "@/utils/server";
import { requireAuth } from "@/lib/auth";
import { getYoutubeVideoPublishedAt } from "@/lib/youtube";

/**
 * 動画を追加
 * @param workId 作品ID
 * @param title タイトル
 * @param vid YouTube の動画ID
 */
export async function addVideoAction(workId: number, title: string, vid: string) {
  await requireAuth();
  const supabase = await createClient();

  const uploadedAt = await getYoutubeVideoPublishedAt(vid);
  const { error } = await supabase
    .from("videos")
    .insert({ work_id: workId, title, vid, uploaded_at: uploadedAt });
  if (error) throw error;
}

/**
 * 動画を更新
 * @param id 動画ID
 * @param title タイトル
 * @param newVid 新しい YouTube の動画ID
 * @param currentVid 現在の YouTube の動画ID
 */
export async function updateVideoAction(id: number, title: string, newVid: string, currentVid: string) {
  await requireAuth();
  const supabase = await createClient();

  let uploadedAt = undefined;
  if (newVid !== currentVid) {
    uploadedAt = await getYoutubeVideoPublishedAt(newVid);
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
}

/**
 * 動画を削除
 * @param id 動画ID
 */
export async function deleteVideoAction(id: number) {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("videos")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
