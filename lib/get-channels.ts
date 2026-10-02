"use server";

import { createClient } from "@/utils/server";

let cachedChannels: any[] | null = null;
let cachedAreas: any[] | null = null;

/**
 * チャンネル一覧を取得（キャッシュがある場合はそのまま使用）
 * @returns チャンネルの配列
 */
export async function getChannels() {
  if (cachedChannels) return cachedChannels;
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select(`
      *,
      areas ( id, name, order )
    `)
    .order("area_id")
    .order("order");

  cachedChannels = data || [];
  return cachedChannels;
}

/**
 * エリア一覧を取得（キャッシュがある場合はそのまま使用）
 * @returns エリアの配列
 */
export async function getAreas() {
  if (cachedAreas) return cachedAreas;
  const supabase = await createClient();
  const { data } = await supabase
    .from("areas")
    .select("*")
    .order("order");

  cachedAreas = data || [];
  return cachedAreas;
}
