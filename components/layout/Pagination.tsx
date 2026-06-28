"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  pageCount: number;
  totalCount: number;
  createPageUrl: (pageNumber: number) => string;
  unit?: string;
  onPageChangeStart?: (pageNumber: number) => void;
}

export function Pagination({
  currentPage,
  pageCount,
  totalCount,
  createPageUrl,
  unit = "作品",
  onPageChangeStart
}: PaginationProps) {
  const [open, setOpen] = useState(false);

  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-10 shrink-0">
      <ButtonGroup>
        {/* 前のページへ */}
        <Button
          variant="secondary"
          size="icon-lg"
          asChild
          disabled={currentPage <= 1}
          className={cn(currentPage <= 1 && "pointer-events-none opacity-50")}
        >
          <Link
            href={createPageUrl(currentPage - 1)}
            aria-label="前のページへ"
            onClick={() => onPageChangeStart?.(currentPage - 1)}
          >
            <ChevronLeft />
          </Link>
        </Button>

        {/* ページ選択ポップオーバー */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" size="lg" className="flex items-center gap-1.5 min-w-16">
              <span>{currentPage}</span>
              <ChevronDown />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-fit min-w-50 p-0 gap-0">
            <div className="text-center px-3 py-2.5 border-b text-xs text-muted-foreground font-medium">
              全{pageCount}ページ・{totalCount}{unit}
            </div>
            <div className={cn(
              "p-3",
              pageCount < 7
                ? "flex justify-center gap-2"
                : "grid grid-cols-7 gap-2 justify-items-center"
            )}>
              {Array.from({ length: pageCount }, (_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "outline" : "ghost"}
                    size="icon"
                    asChild
                    className={cn(
                      "h-9 w-9 rounded-full text-base font-normal p-0",
                      isCurrent
                        ? "border bg-background hover:bg-background text-foreground font-medium shadow-none pointer-events-none"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link
                      href={createPageUrl(pageNum)}
                      onClick={() => {
                        setOpen(false);
                        onPageChangeStart?.(pageNum);
                      }}
                      className="tabular-nums"
                    >
                      {pageNum}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* 次のページへ */}
        <Button
          variant="secondary"
          size="lg"
          asChild
          disabled={currentPage >= pageCount}
          className={cn(
            "flex items-center gap-1.5 px-4",
            currentPage >= pageCount && "pointer-events-none opacity-50"
          )}
        >
          <Link
            href={createPageUrl(currentPage + 1)}
            onClick={() => onPageChangeStart?.(currentPage + 1)}
          >
            <span>次のページへ</span>
            <ChevronRight />
          </Link>
        </Button>
      </ButtonGroup>
    </div>
  );
}
