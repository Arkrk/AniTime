import { createClient } from "@/utils/client";

export type Season = {
  id: number;
  year: number;
  month: number;
  name: string;
};

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient();
  
  // IDの降順（新しい順）で取得
  const { data, error } = await supabase
    .from("seasons")
    .select("id, year, month")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }

  return (data || []).map((season) => ({
    ...season,
    name: `${season.year}年${season.month}月`,
  }));
}