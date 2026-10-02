"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/server";
import { requireAuth } from "@/lib/auth";

/**
 * 作品データを検索
 * @param query 検索クエリ
 * @returns 検索結果
 */
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

/**
 * 作品データを更新
 * @param id 作品ID
 * @param data 作品データ
 * @returns 成功レスポンス
 */
export async function updateWork(id: number, data: {
  name: string;
  name_yomi?: string | null;
  website_url?: string | null;
  x_username?: string | null;
  wikipedia_url?: string | null;
  annict_id?: number | null;
  season_id?: number | null;
  og_image_url?: string | null;
  synopsis?: string | null;
}) {
  await requireAuth();
  const supabase = await createClient();

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

/**
 * 作品データを追加
 * @param data 作品データ
 * @param skipInsertTimestamp タイムスタンプ更新のスキップフラグ
 * @returns 成功レスポンス
 */
export async function createWork(data: {
  name: string;
  name_yomi?: string | null;
  website_url?: string | null;
  x_username?: string | null;
  wikipedia_url?: string | null;
  annict_id?: number | null;
  season_id?: number | null;
  og_image_url?: string | null;
  synopsis?: string | null;
}, skipInsertTimestamp?: boolean) {
  await requireAuth();
  const supabase = await createClient();

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

/**
 * 作品の画像を Supabase Storage にアップロード
 * @param formData 画像データ
 * @returns 画像の公開URL
 */
export async function uploadWorkImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) {
    throw new Error("ファイルが見つかりません。");
  }

  await requireAuth();
  const supabase = await createClient();

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

/**
 * 作品データを削除
 * @param id 作品ID
 * @param redirectTo リダイレクト先（デフォルトはトップページ）
 */
export async function deleteWork(id: number, redirectTo = "/") {
  await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect(redirectTo);
}
