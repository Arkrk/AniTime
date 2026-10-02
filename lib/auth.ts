"use server";

import { createClient } from "@/utils/server";

/**
 * 権限チェック
 * @throws Error 権限がない場合
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("権限がありません。");
  }
}
