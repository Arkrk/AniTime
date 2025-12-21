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
  const { data, error } = await supabase
    .from("programs")
    .select(`
      id,
      start_date,
      start_time,
      end_time,
      color,
      day_of_the_week,
      works ( name ),
      channels (
        id,
        name,
        order,
        areas ( name, order )
      ),
      programs_seasons!inner ( season_id ) 
    `)
    .eq("day_of_the_week", day)
    .eq("programs_seasons.season_id", seasonId) // シーズンを絞り込み
    .order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching schedule:", error);
    return [];
  }

  if (!data) return [];

  // DBのネストしたデータを、UIコンポーネント用のフラットな型(ProgramData)に変換
  const formattedData: ProgramData[] = data.map((item: any) => ({
    id: item.id,
    name: item.works?.name || "未定",
    start_date: item.start_date,
    start_time: item.start_time,
    end_time: item.end_time,
    channel_id: item.channels?.id,
    channel_name: item.channels?.name || "不明なチャンネル",
    // ソート用にチャンネルのオーダーを使用
    channel_order: (item.channels?.areas?.order || 0) * 1000 + (item.channels?.order || 0),
    color: item.color,
  }));

  return formattedData;
}