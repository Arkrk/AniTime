"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 z-50 bg-background/80 rounded-4xl backdrop-blur-md">
      <Button
        size="icon"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft />
      </Button>
    </div>
  );
};
