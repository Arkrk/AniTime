import { createClient } from "@/utils/server";

export type TimelineEvent = {
  id: string;
  type: "create" | "update";
  date: string;
  work: {
    id: number;
    name: string;
    website_url: string | null;
  };
};

export async function getTimelineEvents(limit = 20): Promise<{ events: TimelineEvent[], error: any }> {
  const supabase = await createClient();

  // 最新の作成イベントを取得
  const { data: createdWorks, error: createdError } = await supabase
    .from("works")
    .select("id, name, website_url, created_at")
    .not("created_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  // 最新の更新イベントを取得
  const { data: updatedWorks, error: updatedError } = await supabase
    .from("works")
    .select("id, name, website_url, updated_at")
    .not("updated_at", "is", null)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (createdError || updatedError) {
    return { events: [], error: createdError || updatedError };
  }

  // イベントをマージしてソート
  let events: TimelineEvent[] = [];

  updatedWorks?.forEach((work) => {
    if (work.updated_at) {
      events.push({
        id: `update-${work.id}`,
        type: "update",
        date: work.updated_at,
        work: {
          id: work.id,
          name: work.name,
          website_url: work.website_url,
        },
      });
    }
  });

  createdWorks?.forEach((work) => {
    if (work.created_at) {
      // 同じIDの更新イベントが既に存在する場合は、作成イベントを追加しない（更新イベントを優先）
      const hasUpdateEvent = events.some(
        (e) => e.type === "update" && e.work.id === work.id
      );

      if (!hasUpdateEvent) {
        events.push({
          id: `create-${work.id}`,
          type: "create",
          date: work.created_at,
          work: {
            id: work.id,
            name: work.name,
            website_url: work.website_url,
          },
        });
      }
    }
  });

  // 日付の降順でソート
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 最大表示数
  const displayEvents = events.slice(0, limit);

  return { events: displayEvents, error: null };
}
