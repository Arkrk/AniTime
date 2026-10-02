import { createClient } from "@/utils/client";

export type Season = {
  id: number;
  year: number;
  month: number;
  name: string;
  active: boolean;
};

let cachedSeasons: Season[] | null = null;

/**
 * シーズン一覧を取得（キャッシュがある場合はそのまま使用）
 * @returns シーズンの配列
 */
export async function getSeasons(): Promise<Season[]> {
  if (cachedSeasons) return cachedSeasons;
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
    .sort((a, b) => compareSeasons(a, b, "asc"));

  // activeがfalseのグループ: 年月降順
  const inactiveSeasons = seasons
    .filter((s) => !s.active)
    .sort((a, b) => compareSeasons(a, b, "desc"));

  cachedSeasons = [...activeSeasons, ...inactiveSeasons];
  return cachedSeasons;
}

/**
 * シーズンをソートするための比較関数
 * @param a 年月を持つオブジェクト
 * @param b 年月を持つオブジェクト
 * @param order 昇順または降順
 * @returns 比較結果
 */
export function compareSeasons(
  a: { year: number; month: number },
  b: { year: number; month: number },
  order: "asc" | "desc" = "asc"
) {
  if (a.year !== b.year) {
    return order === "asc" ? a.year - b.year : b.year - a.year;
  }
  return order === "asc" ? a.month - b.month : b.month - a.month;
}

/**
 * クエリパラメータからシーズンIDを取得
 * @param seasonParam クエリパラメータ
 * @param seasons シーズン一覧
 * @param fallbackId フォールバックID
 * @returns シーズンIDまたはフォールバックID
 */
export function resolveSeasonId<T extends number | "all">(
  seasonParam: string | string[] | undefined,
  seasons: Season[],
  fallbackId: T
): number | T {
  const param = Array.isArray(seasonParam) ? seasonParam[0] : seasonParam;

  if (!param) return fallbackId;
  if (param === "all") return "all" as T;

  const match = param.match(/^(\d{4})-(\d{1,2})$/);
  if (!match) return fallbackId;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const season = seasons.find((s) => s.year === year && s.month === month);

  return season?.id ?? fallbackId;
}