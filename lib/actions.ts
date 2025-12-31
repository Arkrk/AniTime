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

export async function getAreasAndChannels() {
  const supabase = await createClient();
  
  const { data: areas, error: areasError } = await supabase
    .from("areas")
    .select("id, name, order")
    .order("order");

  const { data: channels, error: channelsError } = await supabase
    .from("channels")
    .select("id, name, order, area_id")
    .order("order");

  if (areasError || channelsError) {
    console.error("Error fetching master data", areasError, channelsError);
    return { areas: [], channels: [] };
  }

  return { areas, channels };
}
