import { createClient } from "@/utils/client";

/**
 * 作品に紐づく番組データを取得
 * @param workId 作品ID
 * @returns 番組データ
 */
export async function getWorkPrograms(workId: number) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(`
      *,
      channels ( name ),
      programs_seasons ( season_id, seasons ( id, year, month ) ),
      programs_tags ( tag_id, tags ( id, name ) )
    `)
    .eq("work_id", workId)
    .order("order");

  if (error) {
    console.error("Error fetching work programs:", error);
    return [];
  }
  return data;
}
