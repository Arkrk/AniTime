import { createClient } from "@/utils/server";
import { cache } from "react";
import { Database } from "@/types/supabase";

type WorkDetail = Database["public"]["Tables"]["works"]["Row"] & {
  seasons: Pick<Database["public"]["Tables"]["seasons"]["Row"], "id" | "year" | "month"> | null;
  programs: (Database["public"]["Tables"]["programs"]["Row"] & {
    channels: { name: string } | null;
    programs_seasons: { seasons: Pick<Database["public"]["Tables"]["seasons"]["Row"], "id" | "year" | "month"> | null }[];
    programs_tags: { tags: Pick<Database["public"]["Tables"]["tags"]["Row"], "id" | "name"> | null }[];
  })[];
  videos: (Database["public"]["Tables"]["videos"]["Row"])[];
};

// IDを指定して作品データを取得
export const getWorkById = cache(async (id: number) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("works")
    .select(`
      *,
      seasons (
        id,
        year,
        month
      ),
      programs (
        *,
        channels (name),
        programs_seasons (
          seasons (id, year, month)
        ),
        programs_tags (
          tags (id, name)
        )
      ),
      videos (
        id,
        title,
        uploaded_at,
        vid
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching work:", error);
    return null;
  }

  const work = data as any as WorkDetail;

  // programsをorder順にソート
  if (work.programs) {
    work.programs.sort((a, b) => a.order - b.order);
  }

  // videosをuploaded_atの降順にソート
  if (work.videos) {
    work.videos.sort((a, b) => {
      const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
      const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
      return dateB - dateA;
    });
  }

  return work;
});

// 作品データをページ単位で取得
export const getWorks = cache(async (
  page: number = 1,
  limit: number = 50,
  sortColumn: string = "id",
  sortDirection: "asc" | "desc" = "asc",
  seasonId?: number | "all" | null
) => {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("works")
    .select("*, seasons(id, year, month)", { count: "exact" });

  if (seasonId !== undefined && seasonId !== null && seasonId !== "all") {
    query = query.eq("season_id", seasonId);
  }

  const { data, count, error } = await query
    .order(sortColumn, { ascending: sortDirection === "asc" })
    .range(from, to);

  if (error) {
    console.error("Error fetching works:", error);
    return { data: [], count: 0 };
  }

  return { data, count };
});
