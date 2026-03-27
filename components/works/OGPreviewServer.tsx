import React, { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import { OGImageFallback } from "./OGImageFallback";

interface OGPreviewServerProps {
  imageUrl?: string | null;
}

async function OGImageFetcher({ imageUrl }: { imageUrl?: string | null }) {
  if (!imageUrl) {
    return (
      <div className="w-full flex items-center justify-center bg-muted text-muted-foreground rounded-md border aspect-[1.91/1]">
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-md border bg-muted aspect-[1.91/1]">
      <OGImageFallback src={imageUrl} alt="Official Site Preview" />
    </div>
  );
}

export const OGPreviewServer: React.FC<OGPreviewServerProps> = ({ imageUrl }) => {
  return (
    <Suspense 
      fallback={
        <Skeleton className="w-full rounded-md border aspect-[1.91/1]"/>
      }
    >
      <OGImageFetcher imageUrl={imageUrl} />
    </Suspense>
  );
};
