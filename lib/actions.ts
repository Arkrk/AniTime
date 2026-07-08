"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/server";
import { getOGImage } from "@/lib/get-opengraph";

// 認証が必要な処理を行う前に呼び出す関数
async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("権限がありません。");
  }

  return supabase;
}

// 作品データを検索
export async function searchWorks(query: string) {
  if (!query || query.length < 1 || query.length > 100) return [];

  const supabase = await createClient();

  // ワイルドカード文字のエスケープ処理
  const safeQuery = query.replace(/[%_\\]/g, '\\$&');

  const { data, error } = await supabase
    .from("works")
    .select("id, name, name_yomi")
    .or(`name.ilike.%${safeQuery}%,name_yomi.ilike.%${safeQuery}%`)
    .limit(20);

  if (error) {
    console.error("Error searching works:", error);
    return [];
  }
  return data;
}

export async function getAreasAndChannels() {
  const supabase = await createClient();

  const { data: areas, error: areasError } = await supabase
    .from("areas")
    .select("id, name, order")
    .order("order");

  const { data: channels, error: channelsError } = await supabase
    .from("channels")
    .select("id, name, order, area_id")
    .order("order");

  if (areasError || channelsError) {
    console.error("Error fetching master data", areasError, channelsError);
    return { areas: [], channels: [] };
  }

  return { areas, channels };
}

// 作品データを更新
export async function updateWork(id: number, data: {
  name: string;
  name_yomi?: string | null;
  website_url?: string | null;
  x_username?: string | null;
  wikipedia_url?: string | null;
  annict_url?: string | null;
  season_id?: number | null;
  og_image_url?: string | null;
}) {
  const supabase = await requireAuth();

  const updateData: any = { ...data };

  const { error } = await supabase
    .from("works")
    .update(updateData)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/works/${id}`);
  return { success: true };
}

// 作品データを追加
export async function createWork(data: {
  name: string;
  name_yomi?: string | null;
  website_url?: string | null;
  x_username?: string | null;
  wikipedia_url?: string | null;
  annict_url?: string | null;
  season_id?: number | null;
  og_image_url?: string | null;
}, skipInsertTimestamp?: boolean) {
  const supabase = await requireAuth();

  // 作成日時を追加
  const insertData: any = { ...data };
  if (!skipInsertTimestamp) {
    insertData.created_at = new Date().toISOString();
  }

  const { data: newWork, error } = await supabase
    .from("works")
    .insert(insertData)
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  return { success: true, id: newWork.id };
}

// OGP画像URLを取得
export async function fetchOGImageURL(url: string) {
  return await getOGImage(url);
}

// 画像をSupabaseにアップロード
export async function uploadWorkImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("ファイルが見つかりません。");
  }

  const supabase = await requireAuth();

  // 拡張子を取得
  const fileExt = file.name.split('.').pop();
  // ユニークなファイル名を生成 (時刻 + ランダム文字列)
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("work_images")
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`);
  }

  // 公開URLを取得
  const { data: { publicUrl } } = supabase.storage
    .from("work_images")
    .getPublicUrl(fileName);

  return publicUrl;
}

// 作品データを削除
export async function deleteWork(id: number, redirectTo = "/") {
  const supabase = await requireAuth();

  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect(redirectTo);
}
