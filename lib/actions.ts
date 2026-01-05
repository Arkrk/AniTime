"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function updateWork(id: number, data: {
  name: string;
  website_url?: string | null;
  x_username?: string | null;
  wikipedia_url?: string | null;
  annict_url?: string | null;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("works")
    .update(data)
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/works/${id}`);
  return { success: true };
}

export async function deleteWork(id: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("works")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  redirect("/");
}
