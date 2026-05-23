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
}) {
  const supabase = await requireAuth();

  const updateData: any = { ...data };

  if (data.website_url) {
    // 公式サイトURLがある場合はOGP画像を取得
    const ogImage = await getOGImage(data.website_url);
    if (ogImage !== undefined) {
       updateData.og_image_url = ogImage;
    }
  } else if (data.website_url === null) {
    // 公式サイトURLが消されたらOGP画像も消す
    updateData.og_image_url = null;
  }

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
}, skipInsertTimestamp?: boolean) {
  const supabase = await requireAuth();

  // 作成日時を追加
  const insertData: any = { ...data };
  if (!skipInsertTimestamp) {
    insertData.created_at = new Date().toISOString();
  }

  // 公式サイトURLがある場合はOGP画像を取得
  if (insertData.website_url) {
    const ogImage = await getOGImage(insertData.website_url);
    insertData.og_image_url = ogImage;
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

// 作品データを削除
export async function deleteWork(id: number) {
  const supabase = await requireAuth();

  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}
