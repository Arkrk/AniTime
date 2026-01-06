import { createClient } from "@/utils/client";
import { ProgramData } from "@/types/schedule";

// 曜日の定義（1:月曜 〜 7:日曜）
export const DAYS = [
  { id: 1, label: "月", en: "Mon" },
  { id: 2, label: "火", en: "Tue" },
  { id: 3, label: "水", en: "Wed" },
  { id: 4, label: "木", en: "Thu" },
  { id: 5, label: "金", en: "Fri" },
  { id: 6, label: "土", en: "Sat" },
  { id: 7, label: "日", en: "Sun" },
];

export async function getScheduleByDay(day: number, seasonId: number): Promise<ProgramData[]> {
  const supabase = await createClient();

  // Supabaseからデータ取得（リレーションを含む）
  let query = supabase
    .from("programs")
    .select(`
      id,
      start_date,
      start_time,
      end_time,
      color,
      day_of_the_week,
      version,
      note,
      works ( id, name, website_url, annict_url, wikipedia_url, x_username ),
      channels (
        id,
        name,
        order,
        areas ( id, name, order )
      ),
      programs_seasons!inner ( season_id ),
      programs_tags ( tags ( name ) )
    `)
    .eq("programs_seasons.season_id", seasonId) // シーズンを絞り込み
    .order("start_time", { ascending: true });

  // dayが0以外の場合は曜日で絞り込み
  if (day !== 0) {
    query = query.eq("day_of_the_week", day);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }

  if (!data) return [];

  // DBのネストしたデータを、UIコンポーネント用のフラットな型(ProgramData)に変換
  const formattedData: ProgramData[] = data.map((item: any) => ({
    id: item.id,
    work_id: item.works?.id,
    name: item.works?.name || "未定",
    start_date: item.start_date,
    start_time: item.start_time,
    end_time: item.end_time,
    channel_id: item.channels?.id,
    channel_name: item.channels?.name || "不明なチャンネル",
    channel_order: item.channels?.order || 0,
    area_id: item.channels?.areas?.id || 0,
    area_name: item.channels?.areas?.name || "不明なエリア",
    area_order: item.channels?.areas?.order || 0,
    version: item.version,
    note: item.note,
    color: item.color,
    website_url: item.works?.website_url ?? null,
    annict_url: item.works?.annict_url ?? null,
    wikipedia_url: item.works?.wikipedia_url ?? null,
    x_username: item.works?.x_username ?? null,
    day_of_the_week: item.day_of_the_week,
    // タグ配列をフラット化 (例: [{tags: {name: "字"}}, ...] -> ["字", ...])
    tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
  }));

  return formattedData;
}

export async function getWeekScheduleByChannel(seasonId: number, channelId: number): Promise<ProgramData[]> {
  const supabase = await createClient();

  // Supabaseからデータ取得（リレーションを含む）
  const query = supabase
    .from("programs")
    .select(`
      id,
      start_date,
      start_time,
      end_time,
      color,
      day_of_the_week,
      version,
      note,
      works ( id, name, website_url, annict_url, wikipedia_url, x_username ),
      channels!inner (
        id,
        name,
        order,
        areas ( id, name, order )
      ),
      programs_seasons!inner ( season_id ),
      programs_tags ( tags ( name ) )
    `)
    .eq("programs_seasons.season_id", seasonId)
    .eq("channels.id", channelId)
    .order("start_time", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching week schedule:", error);
    return [];
  }

  if (!data) return [];

  // DBのネストしたデータを、UIコンポーネント用のフラットな型(ProgramData)に変換
  const formattedData: ProgramData[] = data.map((item: any) => ({
    id: item.id,
    work_id: item.works?.id,
    name: item.works?.name || "未定",
    start_date: item.start_date,
    start_time: item.start_time,
    end_time: item.end_time,
    channel_id: item.channels?.id,
    channel_name: item.channels?.name || "不明なチャンネル",
    channel_order: item.channels?.order || 0,
    area_id: item.channels?.areas?.id || 0,
    area_name: item.channels?.areas?.name || "不明なエリア",
    area_order: item.channels?.areas?.order || 0,
    version: item.version,
    note: item.note,
    color: item.color,
    website_url: item.works?.website_url ?? null,
    annict_url: item.works?.annict_url ?? null,
    wikipedia_url: item.works?.wikipedia_url ?? null,
    x_username: item.works?.x_username ?? null,
    day_of_the_week: item.day_of_the_week,
    // タグ配列をフラット化 (例: [{tags: {name: "字"}}, ...] -> ["字", ...])
    tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
  }));

  return formattedData;
}

export async function getChannels() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("channels")
    .select(`
      *,
      areas ( id, name, order )
    `)
    .order("area_id")
    .order("order");
    
  return data || [];
}