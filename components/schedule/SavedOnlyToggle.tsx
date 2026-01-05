"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function SavedOnlyToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isSavedOnly = searchParams.get("savedOnly") === "true";

  const handleCheckedChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) {
      params.set("savedOnly", "true");
    } else {
      params.delete("savedOnly");
    }
    router.push(pathname + "?" + params.toString());
  };

  return (
    <Switch
      id="saved-only-mode"
      checked={isSavedOnly}
      onCheckedChange={handleCheckedChange}
    />
  );
}
