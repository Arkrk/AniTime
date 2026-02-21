"use client";

import React, { useEffect, useState } from "react";
import { getOGImage } from "@/lib/get-opengraph";
import { Skeleton } from "@/components/ui/skeleton";

interface ProgramOGPreviewProps {
  url: string;
}

export const ProgramOGPreview: React.FC<ProgramOGPreviewProps> = ({ url }) => {
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    async function fetchOG() {
      if (!url) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(false);
        const image = await getOGImage(url);
        
        if (mounted) {
          if (image) {
            setOgImage(image);
          } else {
            setError(true);
          }
        }
      } catch (err) {
        if (mounted) {
          setError(true);
          console.error(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchOG();

    return () => {
      mounted = false;
    };
  }, [url]);

  if (!url) return null;

  if (loading) {
    return (
      <Skeleton 
        className="w-full rounded-md border" 
        style={{ aspectRatio: "1.91 / 1" }}
      />
    );
  }

  if (error || !ogImage) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-muted text-muted-foreground text-xs rounded-md border"
        style={{ aspectRatio: "1.91 / 1" }}
      >
        画像を取得できません
      </div>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-md border bg-muted" style={{ aspectRatio: "1.91 / 1" }}>
      <img
        src={ogImage}
        alt="Official Site Preview"
        className="object-cover w-full h-full"
        loading="lazy"
        onError={() => setError(true)}
      />
    </div>
  );
};
