"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandSeparator
} from "@/components/ui/command";
import { searchWorks } from "@/lib/actions";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [data, setData] = React.useState<{ id: number; name: string }[]>([]);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    if (!query) {
      setData([]);
      return;
    }

    const timer = setTimeout(() => {
      startTransition(async () => {
        const results = await searchWorks(query);
        setData(results);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (id: number) => {
    onOpenChange(false);
    router.push(`/works/${id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="作品タイトルで検索…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="h-75">
        {query.length > 0 && data.length === 0 && !isPending && (
           <CommandEmpty>作品が見つかりませんでした</CommandEmpty>
        )}
        {data.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="作品">
              {data.map((work) => (
                <CommandItem
                  key={work.id}
                  value={work.name}
                  onSelect={() => handleSelect(work.id)}
                >
                  {work.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
