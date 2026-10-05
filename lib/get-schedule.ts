import { createClient } from "@/utils/client";
import { ProgramData } from "@/types/schedule";

/**
 * 指定したシーズンと曜日の番組表を取得
 * @param day 曜日ID (1〜7)
 * @param seasonId シーズンID
 * @param savedIds 保存済み番組のID配列（オプション）
 * @returns 番組表データ
 */
export async function getScheduleByDay(day: number, seasonId: number, savedIds?: string[]): Promise<ProgramData[]> {
  if (savedIds !== undefined && savedIds.length === 0) {
    return [];
  }

  const supabase = createClient();

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
      works ( id, name, name_yomi, website_url, og_image_url, annict_id, wikipedia_url, x_username ),
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

  // savedIdsが指定されている場合はIDで絞り込み
  if (savedIds && savedIds.length > 0) {
    query = query.in("id", savedIds);
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
    name_yomi: item.works?.name_yomi ?? null,
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
    og_image_url: item.works?.og_image_url ?? null,
    annict_id: item.works?.annict_id ?? null,
    wikipedia_url: item.works?.wikipedia_url ?? null,
    x_username: item.works?.x_username ?? null,
    day_of_the_week: item.day_of_the_week,
    // タグ配列をフラット化 (例: [{tags: {name: "字"}}, ...] -> ["字", ...])
    tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
  }));

  return formattedData;
}

/**
 * 指定したシーズンとチャンネルの週間番組表を取得
 * @param seasonId シーズンID
 * @param channelId チャンネルID
 * @returns 番組表データ
 */
export async function getWeekScheduleByChannel(seasonId: number, channelId: number): Promise<ProgramData[]> {
  const supabase = createClient();

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
      works ( id, name, name_yomi, website_url, og_image_url, annict_id, wikipedia_url, x_username ),
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
    name_yomi: item.works?.name_yomi ?? null,
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
    og_image_url: item.works?.og_image_url ?? null,
    annict_id: item.works?.annict_id ?? null,
    wikipedia_url: item.works?.wikipedia_url ?? null,
    x_username: item.works?.x_username ?? null,
    day_of_the_week: item.day_of_the_week,
    // タグ配列をフラット化 (例: [{tags: {name: "字"}}, ...] -> ["字", ...])
    tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
  }));

  return formattedData;
}

/**
 * 指定したシーズンとエリアの週間番組表を取得
 * @param seasonId シーズンID
 * @param areaId エリアID
 * @returns 番組表データ
 */
export async function getWeekScheduleByArea(seasonId: number, areaId: number): Promise<ProgramData[]> {
  const supabase = createClient();

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
      works ( id, name, name_yomi, website_url, og_image_url, annict_id, wikipedia_url, x_username ),
      channels!inner (
        id,
        name,
        order,
        areas!inner ( id, name, order )
      ),
      programs_seasons!inner ( season_id ),
      programs_tags ( tags ( name ) )
    `)
    .eq("programs_seasons.season_id", seasonId)
    .eq("channels.areas.id", areaId)
    .order("start_time", { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching week schedule by area:", error);
    return [];
  }

  if (!data) return [];

  const formattedData: ProgramData[] = data.map((item: any) => ({
    id: item.id,
    work_id: item.works?.id,
    name: item.works?.name || "未定",
    name_yomi: item.works?.name_yomi ?? null,
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
    og_image_url: item.works?.og_image_url ?? null,
    annict_id: item.works?.annict_id ?? null,
    wikipedia_url: item.works?.wikipedia_url ?? null,
    x_username: item.works?.x_username ?? null,
    day_of_the_week: item.day_of_the_week,
    tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
  }));

  return formattedData;
}

/**
 * 指定したチャンネルと曜日の前後番組表を取得
 * @param channelId チャンネルID
 * @param day 曜日ID (1〜7)
 * @param allSeasons 全シーズンの配列
 * @returns 番組表データ
 */
export async function getSeasonSchedule(channelId: number, day: number, allSeasons: any[]): Promise<ProgramData[]> {
  const supabase = createClient();

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
      works ( id, name, name_yomi, website_url, og_image_url, annict_id, wikipedia_url, x_username ),
      channels!inner (
        id,
        name,
        order,
        areas ( id, name, order )
      ),
      programs_seasons!inner ( 
        season_id
      ),
      programs_tags ( tags ( name ) )
    `)
    .eq("channels.id", channelId)
    .order("start_time", { ascending: true });

  if (day !== 0) {
    query = query.eq("day_of_the_week", day);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching season schedule:", error);
    return [];
  }

  if (!data) return [];

  const formattedData: ProgramData[] = [];
  data.forEach((item: any) => {
    // もし番組が複数のシーズンに紐づいている場合は、それぞれを独立したアイテムとして扱う
    const seasons = item.programs_seasons || [];
    seasons.forEach((ps: any) => {
      const matchedSeason = allSeasons.find(s => s.id === ps.season_id);

      formattedData.push({
        id: item.id,
        work_id: item.works?.id,
        name: item.works?.name || "未定",
        name_yomi: item.works?.name_yomi ?? null,
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
        og_image_url: item.works?.og_image_url ?? null,
        annict_id: item.works?.annict_id ?? null,
        wikipedia_url: item.works?.wikipedia_url ?? null,
        x_username: item.works?.x_username ?? null,
        day_of_the_week: item.day_of_the_week,
        tags: item.programs_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [],
        season_id: ps.season_id,
        season_name: matchedSeason?.name,
        season_year: matchedSeason?.year,
        season_month: matchedSeason?.month,
      });
    });
  });

  return formattedData;
}