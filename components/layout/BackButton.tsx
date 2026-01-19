"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackButton = () => {
  const router = useRouter();

  return (
    <div className="absolute top-4 left-4 z-50">
      <Button
        size="icon"
        variant="outline"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
    </div>
  );
};
