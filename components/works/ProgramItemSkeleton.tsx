import { Skeleton } from "@/components/ui/skeleton";

export function ProgramItemSkeleton({ isLast }: { isLast?: boolean }) {
  return (
    <div
      className={`px-4 py-3.5 flex items-center ${!isLast ? "border-b" : ""
        }`}
    >
      <div className="flex-1 min-w-0 flex flex-col gap-0">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex flex-col md8:flex-row md8:items-center justify-between gap-1.5 flex-1 min-w-0">
            <div className="flex items-center justify-between md8:justify-start gap-2 w-full md8:w-auto min-h-7">
              <div className="flex items-center flex-wrap">
                <Skeleton className="h-5 w-45" />
              </div>
              {/* モバイルサイズ用 */}
              <div className="md8:hidden shrink-0 -mr-1.5 p-1">
                <Skeleton className="h-5 w-5" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <div className="flex items-center">
                <Skeleton className="h-5 w-31" />
              </div>
              <div className="h-3 w-px" />
              <div className="flex items-center">
                <Skeleton className="h-5 w-36" />
              </div>

              {/* デスクトップサイズ用 */}
              <div className="hidden md8:block shrink-0 -mr-1.5 p-1">
                <Skeleton className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
