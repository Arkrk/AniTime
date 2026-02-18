import { createClient } from "@/utils/client";

export type Season = {
  id: number;
  year: number;
  month: number;
  name: string;
  active: boolean;
};

export async function getSeasons(): Promise<Season[]> {
  const supabase = await createClient();
  
  // IDの降順で取得
  const { data, error } = await supabase
    .from("seasons")
    .select("id, year, month, active")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching seasons:", error);
    return [];
  }

  const seasons = (data || []).map((season) => ({
    ...season,
    name: `${season.year}年${season.month}月`,
  }));

  // activeがtrueのグループ: 年月昇順
  const activeSeasons = seasons
    .filter((s) => s.active)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

  // activeがfalseのグループ: 年月降順
  const inactiveSeasons = seasons
    .filter((s) => !s.active)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  return [...activeSeasons, ...inactiveSeasons];
}