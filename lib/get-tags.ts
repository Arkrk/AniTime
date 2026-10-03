import { createClient } from "@/utils/client";

let cachedTags: any[] | null = null;

/**
 * タグ一覧を取得（キャッシュがある場合はそのまま使用）
 * @returns タグの配列
 */
export async function getTags() {
  if (cachedTags) return cachedTags;
  
  const supabase = createClient();
  const { data } = await supabase
    .from("tags")
    .select("*")
    .order("order");

  cachedTags = data || [];
  return cachedTags;
}
