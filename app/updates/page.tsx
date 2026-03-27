import { formatRelativeTime } from "@/lib/date-utils";
import { OGPreviewServer } from "@/components/works/OGPreviewServer";
import Link from "next/link";
import { Metadata } from "next";
import { TvMinimal, PlusCircle } from "lucide-react";
import { defaultOpenGraph } from "@/lib/metadata";
import { getTimelineEvents } from "@/lib/get-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "更新履歴",
  openGraph: { ...defaultOpenGraph, title: "更新履歴", url: "/updates" },
  twitter: { title: "更新履歴" },
};

export default function UpdatesPage() {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <main className="flex-1 px-4 pt-8 pb-16 md:px-8 md:pt-16 md:pb-32 max-w-4xl mx-auto w-full">
        <h1 className="text-3xl md:text-4xl font-bold my-4">更新履歴</h1>
        
        <div className="space-y-8 pt-4">
          <div className="relative border-l border-dashed border-border ml-3">
            <Suspense fallback={<UpdatesSkeleton />}>
              <UpdatesList />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function UpdatesSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="mb-10 ml-7 md:ml-10 relative">
          <div className="flex items-center mb-3 text-sm">
            <Skeleton className="absolute w-8 h-8 rounded-full -left-11 md:-left-14 ring-8 ring-background" />
            <Skeleton className="h-5 w-38.5" />
            <Skeleton className="ml-3 h-5 w-15 rounded-full" />
          </div>
          
          <div className="block">
            <div className="p-2 border border-b rounded-md bg-primary-foreground">
              <div className="flex items-center">
                <div className="w-24 md:w-36 shrink-0 aspect-[1.91/1]">
                  <Skeleton className="w-full h-full border" />
                </div>
                <div className="flex flex-col justify-center mx-3 md:mx-4 flex-1">
                  <Skeleton className="h-4 md:h-5 w-3/4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

async function UpdatesList() {
  const { events: displayEvents, error } = await getTimelineEvents(50);

  if (error) {
    console.error(error);
    return <div className="p-8 text-center text-red-500">エラーが発生しました</div>;
  }

  return (
    <>
      {displayEvents.map((event) => {
        return (
          <div key={event.id} className="mb-10 ml-7 md:ml-10 relative">
            <div className="flex items-center mb-3 text-sm text-muted-foreground">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-background rounded-full -left-11 md:-left-14 ring-8 ring-background text-muted-foreground">
                {event.type === "create" ? (
                  <PlusCircle className="w-5 h-5" />
                ) : (
                  <TvMinimal className="w-5 h-5" />
                )}
              </span>
              <span className="font-medium">
                {event.type === "create" ? "作品を追加しました" : "放送情報を更新しました"}
              </span>
              <span className="h-5 ml-3 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                {formatRelativeTime(event.date)}
              </span>
            </div>
            
            <Link href={`/works/${event.work.id}`} className="block group">
              <div className="p-2 border border-b rounded-md bg-primary-foreground hover:bg-accent transition-colors">
                <div className="flex items-center">
                  <div className="w-24 md:w-36 shrink-0">
                    <OGPreviewServer imageUrl={event.work.og_image_url} />
                  </div>
                  <div className="flex flex-col justify-center mx-3 md:mx-4">
                    <span className="font-medium text-card-foreground text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">{event.work.name}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
            
      {displayEvents.length === 0 && (
        <div className="ml-8 text-muted-foreground">更新履歴がありません</div>
      )}
    </>
  );
}
