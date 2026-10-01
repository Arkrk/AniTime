"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AreaNavigatorProps {
  areas: { id: number; name: string; order: number }[];
  currentAreaId?: number;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

export function AreaNavigator({ areas, currentAreaId, value, onValueChange, className }: AreaNavigatorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const handleAreaChange = (val: string) => {
    if (onValueChange) {
      onValueChange(val);
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("area", val);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loading-start", { detail: params.toString() }));
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const selectedValue = value !== undefined ? value : String(currentAreaId);

  return (
    <Select value={selectedValue} onValueChange={handleAreaChange}>
      <SelectTrigger className={className || "w-45"}>
        <SelectValue placeholder="エリアを選択" />
      </SelectTrigger>
      <SelectContent position="popper">
        <SelectGroup>
          {areas.map((area) => (
            <SelectItem key={area.id} value={String(area.id)}>
              {area.name}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
