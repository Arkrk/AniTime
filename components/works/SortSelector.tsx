"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BookA,
  History,
  ListOrdered,
} from "lucide-react";

type SortSelectorProps = {
  currentSort: string;
  currentOrder: "asc" | "desc";
};

const SORT_OPTIONS = [
  { value: "name_yomi", label: "タイトル", icon: BookA },
  { value: "updated_at", label: "更新日時", icon: History },
  { value: "id", label: "ID", icon: ListOrdered },
];

const ORDER_OPTIONS = [
  { value: "asc", label: "昇順", icon: ArrowUp },
  { value: "desc", label: "降順", icon: ArrowDown },
];

export function SortSelector({ currentSort, currentOrder }: SortSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    updateParams(newSort, currentOrder);
  };

  const handleOrderChange = (newOrder: string) => {
    updateParams(currentSort, newOrder as "asc" | "desc");
  };

  const updateParams = (sort: string, order: "asc" | "desc") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("order", order);
    params.delete("page"); // ソート条件変更時はページ数をリセット

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("loading-start", { detail: params.toString() }));
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon">
          <ArrowUpDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>並べ替えの基準</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currentSort} onValueChange={handleSortChange}>
          {SORT_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                <Icon />
                {opt.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>並べ替えの順序</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={currentOrder} onValueChange={handleOrderChange}>
          {ORDER_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                <Icon />
                {opt.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
