"use server";

import { createClient } from "@/utils/server";

export async function searchWorks(query: string) {
  if (!query || query.length < 1) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("id, name")
    .ilike("name", `%${query}%`)
    .limit(20);
  
  if (error) {
    console.error("Error searching works:", error);
    return [];
  }
  return data;
}
