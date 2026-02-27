import React, { Suspense } from "react";
import { getOGImage } from "@/lib/get-opengraph";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";
import { OGImageFallback } from "./OGImageFallback";

interface OGPreviewServerProps {
  url: string;
}

async function OGImageFetcher({ url }: { url: string }) {
  const ogImage = await getOGImage(url);

  if (!ogImage) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-muted text-muted-foreground rounded-md border"
        style={{ aspectRatio: "1.91 / 1" }}
      >
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-md border bg-muted" style={{ aspectRatio: "1.91 / 1" }}>
      <OGImageFallback src={ogImage} alt="Official Site Preview" />
    </div>
  );
}

export const OGPreviewServer: React.FC<OGPreviewServerProps> = ({ url }) => {
  if (!url) return null;

  return (
    <Suspense 
      fallback={
        <Skeleton 
          className="w-full rounded-md border" 
          style={{ aspectRatio: "1.91 / 1" }}
        />
      }
    >
      <OGImageFetcher url={url} />
    </Suspense>
  );
};
