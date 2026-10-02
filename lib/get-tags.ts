"use server";

import { createClient } from "@/utils/server";

let cachedTags: any[] | null = null;

/**
 * タグ一覧を取得（キャッシュがある場合はそのまま使用）
 * @returns タグの配列
 */
export async function getTags() {
  if (cachedTags) return cachedTags;
  
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .order("order");

  cachedTags = data || [];
  return cachedTags;
}
