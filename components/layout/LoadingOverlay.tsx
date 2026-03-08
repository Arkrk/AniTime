"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

function getSortedParams(paramsStr: string) {
  const p = new URLSearchParams(paramsStr);
  p.sort();
  return p.toString();
}

export function LoadingOverlay({ 
  currentParamsKey,
  eventName,
  children 
}: { 
  currentParamsKey: string;
  eventName: string;
  children: React.ReactNode; 
}) {
  const [targetParamsStr, setTargetParamsStr] = useState<string | null>(null);

  useEffect(() => {
    const handleStart = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setTargetParamsStr(customEvent.detail);
    };
    
    window.addEventListener(eventName, handleStart);
    return () => window.removeEventListener(eventName, handleStart);
  }, [eventName]);

  useEffect(() => {
    if (targetParamsStr !== null && getSortedParams(currentParamsKey) === getSortedParams(targetParamsStr)) {
      setTargetParamsStr(null);
    }
  }, [currentParamsKey, targetParamsStr]);

  const searchParams = useSearchParams();
  const normalizedCurrentKey = getSortedParams(currentParamsKey);
  const normalizedTargetKey = targetParamsStr !== null ? getSortedParams(targetParamsStr) : null;
  const normalizedUrlKey = getSortedParams(searchParams.toString());

  const isPending = (normalizedTargetKey !== null && normalizedTargetKey !== normalizedCurrentKey) || 
                   (normalizedUrlKey !== normalizedCurrentKey);

  return (
    <div className="relative h-full w-full">
      <div className={cn("h-full w-full transition-opacity duration-200", isPending && "opacity-50 pointer-events-none")}>
        {children}
      </div>
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <Spinner className="size-8 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
