"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface OGImageFallbackProps {
  src: string;
}

export const OGImageFallback: React.FC<OGImageFallbackProps> = ({ src }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="size-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      className="object-cover object-center w-full h-full"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};
