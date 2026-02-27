"use client";

import React, { useState } from "react";
import { ImageOff } from "lucide-react";

interface OGImageFallbackProps {
  src: string;
  alt: string;
}

export const OGImageFallback: React.FC<OGImageFallbackProps> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <ImageOff className="w-6 h-6" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="object-cover w-full h-full"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
};
