import { useState, useEffect } from "react";
import { createClient } from "@/utils/client";
import { Database } from "@/types/supabase";
import { useLogin } from "@/hooks/login";
import { arrayMove } from "@dnd-kit/sortable";

type Program = Database["public"]["Tables"]["programs"]["Row"] & {
  channels: { name: string } | null;
  programs_seasons: { season_id: number; seasons: { id: number; year: number; month: number } | null }[];
  programs_tags: { tag_id: number; tags: { id: number; name: string } | null }[];
};
type Channel = Database["public"]["Tables"]["channels"]["Row"] & {
  areas: { id: number; name: string; order: number } | null;
};
type Tag = Database["public"]["Tables"]["tags"]["Row"];
type Season = Database["public"]["Tables"]["seasons"]["Row"];

export function useWorkPrograms(workId: number) {
  const { user } = useLogin();
  const supabase = createClient();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
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

    if (data) {
      setPrograms(data as Program[]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch master data
      const [channelsRes, tagsRes, seasonsRes] = await Promise.all([
        supabase.from("channels").select("*, areas(*)").order("order"),
        supabase.from("tags").select("*").order("order"),
        supabase.from("seasons").select("*").order("id", { ascending: false }),
      ]);

      if (channelsRes.data) setChannels(channelsRes.data);
      if (tagsRes.data) setTags(tagsRes.data);
      if (seasonsRes.data) setSeasons(seasonsRes.data);
      
      await fetchPrograms();
      
      setLoading(false);
    };

    fetchData();
  }, [workId]);

  const addProgram = async (programData: any) => {
    if (!user) return;
    
    const { 
      season_ids, 
      tag_ids, 
      channels, 
      programs_seasons, 
      programs_tags, 
      ...program 
    } = programData;

    // Get max order
    const maxOrder = programs.length > 0 ? Math.max(...programs.map(p => p.order)) : 0;
    
    const { data, error } = await supabase
      .from("programs")
      .insert({ ...program, work_id: workId, order: maxOrder + 1 })
      .select()
      .single();

    if (error) throw error;

    if (data) {
      // Add relations
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
      
      // Update work updated_at
      await supabase.from("works").update({ updated_at: new Date().toISOString() }).eq("id", workId);

      await fetchPrograms();
    }
  };

  const updateProgram = async (id: number, programData: any) => {
    if (!user) return;

    const { 
      season_ids, 
      tag_ids, 
      channels, 
      programs_seasons, 
      programs_tags, 
      ...program 
    } = programData;

    const { error } = await supabase
      .from("programs")
      .update(program)
      .eq("id", id);

    if (error) throw error;

    // Update relations (delete all and re-insert)
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

    // Update work updated_at
    await supabase.from("works").update({ updated_at: new Date().toISOString() }).eq("id", workId);

    await fetchPrograms();
  };

  const deleteProgram = async (id: number) => {
    if (!user) return;

    // Delete relations first
    const { error: seasonsError } = await supabase.from("programs_seasons").delete().eq("program_id", id);
    if (seasonsError) throw seasonsError;

    const { error: tagsError } = await supabase.from("programs_tags").delete().eq("program_id", id);
    if (tagsError) throw tagsError;

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", id);

    if (error) throw error;

    setPrograms(programs.filter(p => p.id !== id));
  };

  const reorderPrograms = async (activeId: number, overId: number) => {
    if (!user) return;

    const oldIndex = programs.findIndex(p => p.id === activeId);
    const newIndex = programs.findIndex(p => p.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newPrograms = arrayMove(programs, oldIndex, newIndex);
      
      // Optimistic update
      setPrograms(newPrograms);

      // Update order in DB
      const updates = newPrograms.map((p, index) => ({
        id: p.id,
        order: index + 1
      }));

      for (const update of updates) {
        await supabase.from("programs").update({ order: update.order }).eq("id", update.id);
      }
    }
  };

  return {
    user,
    programs,
    channels,
    tags,
    seasons,
    loading,
    addProgram,
    updateProgram,
    deleteProgram,
    reorderPrograms
  };
}
