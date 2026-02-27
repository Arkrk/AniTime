import { createClient } from "@/utils/server";
import { formatRelativeTime } from "@/lib/date-utils";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";
import Link from "next/link";
import { Metadata } from "next";
import { Calendar } from "lucide-react";
import { defaultOpenGraph } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "更新履歴",
  openGraph: { ...defaultOpenGraph, title: "更新履歴", url: "/updates" },
  twitter: { title: "更新履歴" },
};

export default async function UpdatesPage() {
  const supabase = await createClient();

  const { data: works, error } = await supabase
    .from("works")
    .select("*")
    .not("updated_at", "is", null)
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error(error);
    return <div className="p-8 text-center text-red-500">エラーが発生しました</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <main className="flex-1 px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-32 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold my-4">更新履歴</h1>
        
        <div className="space-y-8 pt-4">
          <div className="relative border-l border-dashed border-border ml-4 md:ml-6">
            {works?.map((work) => {
              return (
                <div key={work.id} className="mb-10 ml-8 md:ml-10 relative">
                  <div className="flex items-center mb-3 text-sm text-muted-foreground">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-background rounded-full -left-[48px] md:-left-[56px] ring-8 ring-background text-muted-foreground">
                      <Calendar className="w-5 h-5" />
                    </span>
                    <span>放送スケジュールを更新しました</span>
                    <span className="ml-3 px-2.5 py-0.5 rounded-full bg-muted text-xs font-medium">
                      {formatRelativeTime(work.updated_at!)}
                    </span>
                  </div>
                  
                  <Link href={`/works/${work.id}`} className="block group">
                    <div className="p-4 border border-b rounded-md hover:bg-accent transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-28 flex-shrink-0">
                          <OGPreviewServer url={work.website_url || ""} />
                        </div>
                        <div className="flex flex-col justify-center">
                          <span className="font-medium text-card-foreground text-base line-clamp-2 group-hover:text-primary transition-colors">{work.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
            
            {works?.length === 0 && (
              <div className="ml-8 text-muted-foreground">更新履歴がありません</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
