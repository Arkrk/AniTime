import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import { OGImageFallback } from "./OGImageFallback";
import { cn } from "@/lib/utils";

interface OGPreviewServerProps {
  imageUrl?: string | null;
  className?: string;
}

async function OGImageFetcher({ imageUrl, className }: { imageUrl?: string | null; className?: string }) {
  if (!imageUrl) {
    return (
      <div className={cn("w-full flex items-center justify-center bg-muted text-muted-foreground aspect-[1.91/1]", className)}>
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className={cn("w-full relative overflow-hidden bg-muted aspect-[1.91/1]", className)}>
      <OGImageFallback src={imageUrl} alt="Official Site Preview" />
    </div>
  );
}

export const OGPreviewServer: React.FC<OGPreviewServerProps> = ({ imageUrl, className }) => {
  return (
    <Suspense
      fallback={
        <Skeleton className={cn("w-full aspect-[1.91/1]", className)} />
      }
    >
      <OGImageFetcher imageUrl={imageUrl} className={className} />
    </Suspense>
  );
};
