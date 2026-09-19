"use server";

import { createClient } from "@/utils/server";

// 認証が必要な処理を行う前に呼び出す関数
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("権限がありません。");
  }
}
