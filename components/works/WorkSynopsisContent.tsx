"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function WorkSynopsisContent({ htmlContent }: { htmlContent: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (contentRef.current) {
        // テキスト部分が5行（md以上:140px, 未満:120px）を超えているか判定
        // spacer (16px) を含むため、テキスト自体の実際の高さは scrollHeight - 16
        const limit = window.innerWidth >= 768 ? 140 : 120;
        const isOverflowing = contentRef.current.scrollHeight - 16 > limit;
        setShowButton(isOverflowing);

        // 画面幅が広がりテキストが5行に収まった場合は、展開状態をリセットする
        if (!isOverflowing) {
          setIsExpanded(false);
        }
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [htmlContent]);

  return (
    <div className="relative bg-primary-foreground pt-4 px-4 pb-0 border rounded-2xl flex flex-col">
      <div
        ref={contentRef}
        className={cn(
          "overflow-hidden transition-[max-height] duration-500 ease-in-out",
          !isExpanded ? "max-h-34 md:max-h-39" : "max-h-[2000px]"
        )}
      >
        <div
          className="prose dark:prose-invert max-w-none text-sm md:text-base leading-6 md:leading-7"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        {/* 短いテキストの場合は下部余白として機能し、長いテキストで折りたたまれている場合は max-height によって切り取られ非表示になる */}
        <div className="h-4 shrink-0" />
      </div>

      {showButton && !isExpanded && (
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-primary-foreground to-transparent rounded-b-2xl flex items-end justify-center pb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="bg-primary-foreground/90 backdrop-blur-sm shadow-sm text-xs md:text-sm"
          >
            すべて表示
            <ChevronDown className="w-4 h-4 md:w-4 md:h-4 ml-1" />
          </Button>
        </div>
      )}

    </div>
  );
}
