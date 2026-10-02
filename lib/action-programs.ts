"use server";

import { createClient } from "@/utils/server";
import { requireAuth } from "@/lib/auth";

/**
 * 作品に紐づく番組データを取得
 * @param workId 作品ID
 * @returns 番組データ
 */
export async function getWorkPrograms(workId: number) {
  const supabase = await createClient();
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

/**
 * 番組データを追加
 * @param workId 作品ID
 * @param programData 番組データ
 */
export async function addProgramAction(workId: number, programData: any) {
  await requireAuth();
  const supabase = await createClient();

  const {
    season_ids,
    tag_ids,
    channels,
    programs_seasons,
    programs_tags,
    skipUpdateTimestamp,
    ...program
  } = programData;

  const { data: existingPrograms } = await supabase
    .from("programs")
    .select("order")
    .eq("work_id", workId);

  const maxOrder = existingPrograms && existingPrograms.length > 0
    ? Math.max(...existingPrograms.map(p => p.order))
    : 0;

  const { data, error } = await supabase
    .from("programs")
    .insert({ ...program, work_id: workId, order: maxOrder + 1 })
    .select()
    .single();

  if (error) throw error;

  if (data) {
    if (season_ids?.length) {
      await supabase.from("programs_seasons").insert(
        season_ids.map((sid: number) => ({ program_id: data.id, season_id: sid }))
      );
    }
    if (tag_ids?.length) {
      await supabase.from("programs_tags").insert(
        tag_ids.map((tid: number) => ({ program_id: data.id, tag_id: tid }))
      );
    }

    if (!skipUpdateTimestamp) {
      await supabase.from("works").update({ updated_at: new Date().toISOString() }).eq("id", workId);
    }
  }
}

/**
 * 番組データを更新
 * @param workId 作品ID
 * @param id 番組ID
 * @param programData 番組データ
 */
export async function updateProgramAction(workId: number, id: number, programData: any) {
  await requireAuth();
  const supabase = await createClient();

  const {
    season_ids,
    tag_ids,
    channels,
    programs_seasons,
    programs_tags,
    skipUpdateTimestamp,
    ...program
  } = programData;

  const { error } = await supabase
    .from("programs")
    .update(program)
    .eq("id", id);

  if (error) throw error;

  if (season_ids !== undefined) {
    await supabase.from("programs_seasons").delete().eq("program_id", id);
    if (season_ids.length > 0) {
      await supabase.from("programs_seasons").insert(
        season_ids.map((sid: number) => ({ program_id: id, season_id: sid }))
      );
    }
  }

  if (tag_ids !== undefined) {
    await supabase.from("programs_tags").delete().eq("program_id", id);
    if (tag_ids.length > 0) {
      await supabase.from("programs_tags").insert(
        tag_ids.map((tid: number) => ({ program_id: id, tag_id: tid }))
      );
    }
  }

  if (!skipUpdateTimestamp) {
    await supabase.from("works").update({ updated_at: new Date().toISOString() }).eq("id", workId);
  }
}

/**
 * 番組データを削除
 * @param id 番組ID
 */
export async function deleteProgramAction(id: number) {
  await requireAuth();
  const supabase = await createClient();

  const { error: seasonsError } = await supabase.from("programs_seasons").delete().eq("program_id", id);
  if (seasonsError) throw seasonsError;

  const { error: tagsError } = await supabase.from("programs_tags").delete().eq("program_id", id);
  if (tagsError) throw tagsError;

  const { error } = await supabase
    .from("programs")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * 番組の並び順を更新
 * @param updates 新しい並び順 {番組ID, 並び順}
 */
export async function saveProgramsOrderAction(updates: { id: number, order: number }[]) {
  await requireAuth();
  const supabase = await createClient();

  for (const update of updates) {
    const { error } = await supabase.from("programs").update({ order: update.order }).eq("id", update.id);
    if (error) throw error;
  }
}
